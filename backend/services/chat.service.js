const redis = require("../utils/redis");
const { getIO } = require("../config/socket");
const ChatRoomModel = require("../models/chat_room.model");
const MegaphoneLogModel = require("../models/megaphone_log.model");
const UserCurrency = require("../models/userCurrency.model");
const InventoryModel = require("../models/inventory.model");
const db = require("../config/db");
const logger = require("../utils/logger");

const REDIS_CHAT_PREFIX = "chat:room:";
const REDIS_AUTHOR_ROOM_PREFIX = "chat:author:";
const REDIS_COOLDOWN_PREFIX = "chat:cooldown:";
const REDIS_MUTE_PREFIX = "chat:mute:";
const MESSAGE_BUFFER_LIMIT = 50;
const MEGAPHONE_COST = 100;
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

  return normalized.map((message) => {
    const uid = Number(message.userId);
    const userMeta = userMap.get(uid);
    return {
      ...message,
      fullName: message?.fullName || message?.full_name || userMeta?.fullName || message?.username || "Anonymous",
      avatar: message?.avatar || userMeta?.avatar || "",
      equipped_frame: message?.equipped_frame || frameMap.get(uid) || null,
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
    const frameMap = await InventoryModel.getEquippedAvatarFramesForUsers([userId]);
    const messageData = {
      userId,
      username: username || displayName,
      fullName: displayName,
      avatar,
      equipped_frame: frameMap.get(userId) || null,
      content: text,
      timestamp: Date.now(),
      isMegaphone,
    };

    const bufferKey = `${REDIS_CHAT_PREFIX}${roomId}:messages`;
    await redis.lpush(bufferKey, JSON.stringify(messageData));
    await redis.ltrim(bufferKey, 0, MESSAGE_BUFFER_LIMIT - 1);

    if (!isMegaphone) {
      await redis.set(cooldownKey, "1", "EX", COOLDOWN_SECONDS);
    }

    const io = getIO();
    io.to(`room_${roomId}`).emit(isMegaphone ? "new_megaphone" : "new_message", messageData);

    if (!isMegaphone) {
      const { sendNotification, NOTIFY_TYPES } = require("./notification.services");
      const mentionRegex = /@(\w+)/g;
      const mentions = [...text.matchAll(mentionRegex)];

      for (const match of mentions) {
        const targetUsername = match[1];
        const [targetUsers] = await dbContext.query("SELECT id FROM users_new WHERE username = ?", [targetUsername]);
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
        true,
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

  joinAuthorRoom: async (userId, authorId) => {
    const statusKey = `${REDIS_AUTHOR_ROOM_PREFIX}${authorId}:status`;
    const usersKey = `${REDIS_AUTHOR_ROOM_PREFIX}${authorId}:users`;

    const isActive = await redis.get(statusKey);
    if (!isActive) {
      await redis.set(statusKey, "active");
    }

    await redis.sadd(usersKey, userId);
    const count = await redis.scard(usersKey);
    const history = await ChatService.getAuthorRoomHistory(authorId);

    return { success: true, onlineCount: count, history };
  },

  leaveAuthorRoom: async (userId, authorId) => {
    const usersKey = `${REDIS_AUTHOR_ROOM_PREFIX}${authorId}:users`;
    await redis.srem(usersKey, userId);
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
    const frameMap = await InventoryModel.getEquippedAvatarFramesForUsers([userId]);
    const messageData = {
      userId,
      username: username || displayName,
      fullName: displayName,
      avatar,
      equipped_frame: frameMap.get(userId) || null,
      content: text,
      timestamp: Date.now(),
      author_id: authorId,
    };

    const bufferKey = `${REDIS_AUTHOR_ROOM_PREFIX}${authorId}:messages`;
    await redis.lpush(bufferKey, JSON.stringify(messageData));
    await redis.ltrim(bufferKey, 0, MESSAGE_BUFFER_LIMIT - 1);
    await redis.set(cooldownKey, "1", "EX", COOLDOWN_SECONDS);

    const io = getIO();
    io.to(`author_room_${authorId}`).emit("new_author_message", messageData);

    return messageData;
  },

  getAuthorRoomHistory: async (authorId) => {
    const bufferKey = `${REDIS_AUTHOR_ROOM_PREFIX}${authorId}:messages`;
    const messages = await redis.lrange(bufferKey, 0, -1);
    const parsed = messages.map((message) => JSON.parse(message)).reverse();
    return await enrichMessagesWithFullName(parsed);
  },

  getAuthorOnlineCount: async (authorId) => {
    const usersKey = `${REDIS_AUTHOR_ROOM_PREFIX}${authorId}:users`;
    return await redis.scard(usersKey);
  },
};

module.exports = ChatService;

