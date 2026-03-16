const redis = require("../utils/redis");
const { getIO } = require("../config/socket");
const ChatRoomModel = require("../models/chat_room.model");
const MegaphoneLogModel = require("../models/megaphone_log.model");
const UserCurrency = require("../models/userCurrency.model");
const InventoryModel = require("../models/inventory.model");
const ChatMessageModel = require("../models/chat_message.model");
const ChatProfileService = require("./chatProfile.service");
const db = require("../config/db");
const logger = require("../utils/logger");

const REDIS_CHAT_PREFIX = "chat:room:";
const REDIS_AUTHOR_ROOM_PREFIX = "chat:author:";
const REDIS_COOLDOWN_PREFIX = "chat:cooldown:";
const REDIS_MUTE_PREFIX = "chat:mute:";
const MESSAGE_BUFFER_LIMIT = 50;
const MEGAPHONE_COST = 20;
const COOLDOWN_SECONDS = 3;

const enrichMessagesWithFullName = async (messages = []) => {
  const normalized = messages.map((message) => ({
    ...message,
    content: message?.content || message?.text || "",
  }));

  const userIds = [
    ...new Set(
      normalized
        .filter((message) => message && message.userId)
        .map((message) => Number(message.userId))
        .filter((id) => !Number.isNaN(id))
    ),
  ];

  if (userIds.length === 0) {
    return normalized.map((message) => ({
      ...message,
      fullName: message?.fullName || message?.full_name || message?.username || "Anonymous",
      equipped_frame: message?.equipped_frame || null,
    }));
  }

  const placeholders = userIds.map(() => "?").join(",");
  const [rows] = await db.query(
    `SELECT id, full_name, username, avatar FROM users_new WHERE id IN (${placeholders})`,
    userIds
  );

  const userMap = new Map(
    rows.map((row) => [Number(row.id), {
      fullName: row.full_name || row.username || "Anonymous",
      avatar: row.avatar || "",
    }])
  );
  const frameMap = await InventoryModel.getEquippedAvatarFramesForUsers(userIds);
  const colorMap = await InventoryModel.getEquippedChatColorsForUsers(userIds);
  const badgeMap = await InventoryModel.getEquippedBadgesForUsers(userIds);

  return normalized.map((message) => {
    const uid = Number(message.userId);
    const userMeta = userMap.get(uid);
    return {
      ...message,
      fullName: message?.fullName || message?.full_name || userMeta?.fullName || message?.username || "Anonymous",
       avatar: message?.avatar || userMeta?.avatar || "",
      equipped_frame: message?.equipped_frame || frameMap.get(uid) || null,
      equipped_chat_color: message?.equipped_chat_color || colorMap.get(uid) || null,
      badge: message?.badge || badgeMap.get(uid) || null,
    };
  });
};

const ChatService = {
  sendMessage: async (
    userId,
    username,
    fullName,
    avatar,
    roomId,
    text,
    isMegaphone = false,
    connection = null,
  ) => {
    const dbContext = connection || db;
    const cooldownKey = `${REDIS_COOLDOWN_PREFIX}${userId}`;
    const onCooldown = await redis.exists(cooldownKey);
    if (onCooldown && !isMegaphone) {
      throw new Error("Dao huu truyen am qua nhanh, hay nghi ngoi!");
    }

    const room = await ChatRoomModel.getRoomById(roomId);
    if (!room) throw new Error("Phong khong ton tai!");

    if (room.room_type !== "world") {
      const isMember = await ChatRoomModel.isMember(roomId, userId);
      if (!isMember) throw new Error("Ban khong co lenh bai vao phong nay!");

      const muteStatus = await ChatService.checkMuteStatus(roomId, userId);
      if (!muteStatus.allowed) {
        throw new Error(muteStatus.message);
      }
    }

    const displayName = fullName || username || `Tu si #${userId}`;
    const chatProfile = await ChatProfileService.getProfile(userId);
    const frame = chatProfile?.equipped_frame || null;
    const chatColor = chatProfile?.equipped_chat_color || null;
    const badge = chatProfile?.badge || null;
    const level = chatProfile?.level || null;
    // Persist to unified chat_messages with style snapshot
    let insertedId = null;
    try {
      const styleSnapshot = JSON.stringify({
        equipped_frame: frame,
        equipped_chat_color: chatColor,
        badge,
        level,
      });
      const roomType = room.room_type === "world" ? "world" : "author";
      const roomIdentifier = room.room_type === "world" ? 1 : room.owner_id || room.id;
      insertedId = await ChatMessageModel.create(
        {
          room_type: roomType,
          room_id: roomIdentifier,
          user_id: userId,
          content: text,
          style_snapshot: styleSnapshot,
          is_megaphone: isMegaphone,
        },
        dbContext,
      );
    } catch (persistErr) {
      logger.error("Failed to persist chat message:", persistErr);
    }

    const messageData = {
      id: insertedId,
      userId,
      username: username || displayName,
      fullName: displayName,
      avatar,
      equipped_frame: frame,
      equipped_chat_color: chatColor,
      badge,
      level,
      content: text,
      timestamp: Date.now(),
      isMegaphone,
    };

    // World chat history now comes from chat_messages; Redis used only for non-world buffers
    if (room.room_type !== "world") {
      // Author / other rooms: use Redis buffer for fast recent history
      const bufferKey = `${REDIS_CHAT_PREFIX}${roomId}:messages`;
      await redis.lpush(bufferKey, JSON.stringify(messageData));
      await redis.ltrim(bufferKey, 0, MESSAGE_BUFFER_LIMIT - 1);
    }

    if (!isMegaphone) {
      await redis.set(cooldownKey, "1", "EX", COOLDOWN_SECONDS);
    }

    const io = getIO();
    io.to(`room_${roomId}`).emit(isMegaphone ? "new_megaphone" : "new_message", messageData);

    if (!isMegaphone) {
      const { sendNotification, NOTIFY_TYPES } = require("./notification.services");
      const mentionRegex = /@(\w+)/g;
      const uniqueMentions = [...new Set([...text.matchAll(mentionRegex)].map((m) => m[1].toLowerCase()))];

      for (const targetUsername of uniqueMentions) {
        const [targetUsers] = await dbContext.query("SELECT id FROM users_new WHERE LOWER(username) = ?", [targetUsername]);
        if (targetUsers.length > 0 && targetUsers[0].id !== userId) {
          await sendNotification(
            targetUsers[0].id,
            `${displayName} da nhac den ban trong chat: "${text.substring(0, 50)}..."`,
            NOTIFY_TYPES.MENTION,
            roomId,
          );
        }
      }
    }

    return messageData;
  },

  sendWorldMegaphone: async (userId, username, fullName, avatar, text) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await UserCurrency.deduct(userId, MEGAPHONE_COST, connection);
      await MegaphoneLogModel.create(
        {
          user_id: userId,
          message: text,
          cost: MEGAPHONE_COST,
          item_used: "truyen_am_phu",
        },
        connection,
      );

      const message = await ChatService.sendMessage(
        userId,
        username,
        fullName,
        avatar,
        1,
        text,
        false, // <--- CHANGED: normal world chat is NOT a scrolling megaphone
        connection,
      );

      await connection.commit();
      return message;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  sendWorldMegaphoneItem: async (userId, username, fullName, avatar, text) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Deduct 1 'Loa Truyền Âm' (shop_item_id = 3) from user's inventory
      const [updateResult] = await connection.query(
        `UPDATE user_inventory 
         SET quantity = quantity - 1 
         WHERE user_id = ? AND shop_item_id = 3 AND quantity > 0`,
        [userId]
      );

      if (updateResult.affectedRows === 0) {
        throw new Error("Bạn không có Đạn Truyền Âm (Loa Truyền Âm) trong túi đồ!");
      }

      // Auto-delete the row when quantity reaches zero
      await connection.query(
        `DELETE FROM user_inventory WHERE user_id = ? AND shop_item_id = 3 AND quantity <= 0`,
        [userId]
      );

      await MegaphoneLogModel.create(
        {
          user_id: userId,
          message: text,
          cost: 0, // Paid via item
          item_used: "loa_truyen_am", // Correct item identifier
        },
        connection,
      );

      const message = await ChatService.sendMessage(
        userId,
        username,
        fullName,
        avatar,
        1,
        text,
        true, // <--- This one IS a scrolling megaphone
        connection,
      );

      await connection.commit();
      return message;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  getRoomHistory: async (roomId) => {
    const room = await ChatRoomModel.getRoomById(roomId);
    if (room && room.room_type === "world") {
      // Prefer unified chat_messages; if empty, fall back to legacy megaphone_logs
      const recent = await ChatMessageModel.getRecentByRoom("world", Number(roomId), 50);
      if (recent.length > 0) {
        const messages = recent
          .slice()
          .reverse()
          .map((row) => {
            let snapshot = {};
            if (row.style_snapshot) {
              try {
                snapshot = JSON.parse(row.style_snapshot);
              } catch (e) {
                snapshot = {};
              }
            }
            return {
              id: row.id,
              userId: row.user_id,
              content: row.content,
              isMegaphone: !!row.is_megaphone,
              timestamp: new Date(row.created_at).getTime(),
              equipped_frame: snapshot.equipped_frame || null,
              equipped_chat_color: snapshot.equipped_chat_color || null,
              badge: snapshot.badge || null,
              level: snapshot.level || null,
            };
          });
        return await enrichMessagesWithFullName(messages);
      }

      const [rows] = await db.query(
        `SELECT ml.id, ml.user_id AS userId, ml.message AS content, ml.created_at, ml.item_used,
                u.full_name, u.username, u.avatar
         FROM megaphone_logs ml
         JOIN users_new u ON u.id = ml.user_id
         ORDER BY ml.created_at DESC
         LIMIT 50`,
      );
      const legacyMessages = rows.reverse().map((row) => {
        let timestamp = new Date(row.created_at).getTime();
        if (row.created_at instanceof Date) {
          timestamp = timestamp - row.created_at.getTimezoneOffset() * 60000;
        }
        return {
          id: row.id,
          userId: row.userId,
          fullName: row.full_name || row.username || "Anonymous",
          username: row.username,
          avatar: row.avatar || "",
          content: row.content,
          isMegaphone: row.item_used === "loa_truyen_am",
          timestamp,
        };
      });
      return await enrichMessagesWithFullName(legacyMessages);
    }

    // For author rooms: use Redis
    const bufferKey = `${REDIS_CHAT_PREFIX}${roomId}:messages`;
    const messages = await redis.lrange(bufferKey, 0, -1);
    const parsed = messages.map((message) => JSON.parse(message)).reverse();
    return await enrichMessagesWithFullName(parsed);
  },

  muteUser: async (roomId, userId, durationSeconds, reason) => {
    const muteKey = `${REDIS_MUTE_PREFIX}${roomId}:${userId}`;
    const mutedUntil = new Date(Date.now() + durationSeconds * 1000);
    await db.query(
      "UPDATE chat_room_members SET is_muted = TRUE, muted_until = ?, mute_reason = ? WHERE room_id = ? AND user_id = ?",
      [mutedUntil, reason, roomId, userId],
    );
    await redis.set(muteKey, reason, "EX", durationSeconds);
    return { success: true, mutedUntil };
  },

  checkMuteStatus: async (roomId, userId) => {
    const muteKey = `${REDIS_MUTE_PREFIX}${roomId}:${userId}`;
    const reason = await redis.get(muteKey);
    if (reason) {
      return {
        allowed: false,
        message: `Ban dang bi cam ngon. Ly do: ${reason}`,
      };
    }

    const memberInfo = await ChatRoomModel.getMemberInfo(roomId, userId);
    if (memberInfo && memberInfo.is_muted) {
      const now = new Date();
      const mutedUntil = new Date(memberInfo.muted_until);

      if (!memberInfo.muted_until || mutedUntil > now) {
        const remainingSeconds = memberInfo.muted_until
          ? Math.ceil((mutedUntil.getTime() - now.getTime()) / 1000)
          : 3600;

        const reasonFromDb = memberInfo.mute_reason || "Vi pham quy tac phong";
        await redis.set(muteKey, reasonFromDb, "EX", remainingSeconds);
        return {
          allowed: false,
          message: `Ban dang bi cam ngon. Ly do: ${reasonFromDb}`,
        };
      }

      await db.query(
        "UPDATE chat_room_members SET is_muted = FALSE, mute_reason = NULL WHERE room_id = ? AND user_id = ?",
        [roomId, userId],
      );
    }

    return { allowed: true };
  },

  /**
   * Socket-level presence: track socketId per user to avoid multi-tab miscount.
   * When first socket of user joins: add userId to users set.
   * When last socket of user leaves: remove userId from users set.
   */
  joinAuthorRoom: async (userId, authorId, socketId) => {
    const statusKey = `${REDIS_AUTHOR_ROOM_PREFIX}${authorId}:status`;
    const usersKey = `${REDIS_AUTHOR_ROOM_PREFIX}${authorId}:users`;
    const userSocketsKey = `${REDIS_AUTHOR_ROOM_PREFIX}${authorId}:user_sockets:${userId}`;

    const isActive = await redis.get(statusKey);
    if (!isActive) {
      await redis.set(statusKey, "active");
    }

    await redis.sadd(userSocketsKey, socketId);
    const socketCount = await redis.scard(userSocketsKey);
    if (socketCount === 1) {
      await redis.sadd(usersKey, userId);
    }
    const count = await redis.scard(usersKey);
    const history = await ChatService.getAuthorRoomHistory(authorId);

    return { success: true, onlineCount: count, history };
  },

  leaveAuthorRoom: async (userId, authorId, socketId) => {
    const usersKey = `${REDIS_AUTHOR_ROOM_PREFIX}${authorId}:users`;
    const userSocketsKey = `${REDIS_AUTHOR_ROOM_PREFIX}${authorId}:user_sockets:${userId}`;

    await redis.srem(userSocketsKey, socketId);
    const remaining = await redis.scard(userSocketsKey);
    if (remaining === 0) {
      await redis.del(userSocketsKey);
      await redis.srem(usersKey, userId);
    }
    const count = await redis.scard(usersKey);
    return { success: true, onlineCount: count };
  },

  sendAuthorMessage: async (userId, username, fullName, avatar, authorId, text) => {
    const cooldownKey = `${REDIS_COOLDOWN_PREFIX}${userId}`;
    const onCooldown = await redis.exists(cooldownKey);
    if (onCooldown) {
      throw new Error("Khong the gui tin nhan qua nhanh!");
    }

    const displayName = fullName || username || `Tu si #${userId}`;
    const chatProfile = await ChatProfileService.getProfile(userId);
    const frame = chatProfile?.equipped_frame || null;
    const chatColor = chatProfile?.equipped_chat_color || null;
    const badge = chatProfile?.badge || null;
    const level = chatProfile?.level || null;
    // Persist to unified chat_messages with style snapshot
    let insertedId = null;
    try {
      const styleSnapshot = JSON.stringify({
        equipped_frame: frame,
        equipped_chat_color: chatColor,
        badge,
        level,
      });
      insertedId = await ChatMessageModel.create({
        room_type: "author",
        room_id: Number(authorId),
        user_id: userId,
        content: text,
        style_snapshot: styleSnapshot,
        is_megaphone: false,
      });
    } catch (persistErr) {
      logger.error("Failed to persist author chat message:", persistErr);
    }

    const messageData = {
      id: insertedId,
      userId,
      username: username || displayName,
      fullName: displayName,
      avatar,
      equipped_frame: frame,
      equipped_chat_color: chatColor,
      badge,
      level,
      content: text,
      timestamp: Date.now(),
      author_id: authorId,
    };

    const io = getIO();
    io.to(`author_room_${authorId}`).emit("new_author_message", messageData);

    return messageData;
  },

  getAuthorRoomHistory: async (authorId) => {
    const recent = await ChatMessageModel.getRecentByRoom("author", Number(authorId), MESSAGE_BUFFER_LIMIT);
    if (recent.length === 0) {
      // Fallback to Redis buffer for pre-migration messages
      const bufferKey = `${REDIS_AUTHOR_ROOM_PREFIX}${authorId}:messages`;
      const messages = await redis.lrange(bufferKey, 0, -1);
      const parsed = messages.map((message) => JSON.parse(message)).reverse();
      return await enrichMessagesWithFullName(parsed);
    }

    const mapped = recent
      .slice()
      .reverse()
      .map((row) => {
        let snapshot = {};
        if (row.style_snapshot) {
          try {
            snapshot = JSON.parse(row.style_snapshot);
          } catch (e) {
            snapshot = {};
          }
        }
        return {
          id: row.id,
          userId: row.user_id,
          content: row.content,
          author_id: String(authorId),
          timestamp: new Date(row.created_at).getTime(),
          equipped_frame: snapshot.equipped_frame || null,
          equipped_chat_color: snapshot.equipped_chat_color || null,
          badge: snapshot.badge || null,
          level: snapshot.level || null,
        };
      });
    return await enrichMessagesWithFullName(mapped);
  },

  getAuthorOnlineCount: async (authorId) => {
    const usersKey = `${REDIS_AUTHOR_ROOM_PREFIX}${authorId}:users`;
    return await redis.scard(usersKey);
  },
};

module.exports = ChatService;

