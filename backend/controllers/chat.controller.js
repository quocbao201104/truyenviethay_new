const ChatService = require("../services/chat.service");
const onlineStatusService = require("../services/onlineStatus.service");
const UserModel = require("../models/user.model");
const db = require("../config/db");
const logger = require("../utils/logger");

const MEGAPHONE_ITEM_ID = 3; // shop_items ID for 'Loa Truyền Âm'

/** Check if user owns item ID 3 (Loa Truyền Âm) via user_inventory */
const userHasMegaphone = async (userId) => {
  const [[row]] = await db.query(
    `SELECT id FROM user_inventory WHERE user_id = ? AND shop_item_id = ? AND quantity > 0 LIMIT 1`,
    [userId, MEGAPHONE_ITEM_ID]
  );
  return !!row;
};

const ChatController = {
  /**
   * Send Megaphone message (World Chat) — costs 100 LT
   */
  sendMegaphone: async (req, res) => {
    try {
      const { message } = req.body;
      const userId = req.user.id;

      const users = await UserModel.findById(userId);
      if (!users || users.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy thông tin tài khoản!" });
      }
      const dbUser = users[0];

      let displayName = dbUser.full_name || dbUser.username || `#${userId}`;
      const avatar = dbUser.avatar;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ message: "Nội dung không được để trống!" });
      }
      if (message.length > 500) {
        return res.status(400).json({ message: "Nội dung quá dài (tối đa 500 ký tự)!" });
      }

      const result = await ChatService.sendWorldMegaphone(
        userId,
        dbUser.username,
        displayName,
        avatar,
        req.user.role,
        message,
      );

      res.json({ success: true, message: "Truyền âm thành công!", data: result });
    } catch (error) {
      if (error.message && error.message.includes("Không đủ Linh Thạch")) {
         return res.status(400).json({ message: error.message });
      }
      logger.error("sendMegaphone error:", error);
      res.status(500).json({ message: error.message || "Lỗi server khi truyền âm." });
    }
  },

  /**
   * Send Megaphone message using Item ID 3 (Loa Truyền Âm)
   */
  sendMegaphoneItem: async (req, res) => {
    try {
      const { message } = req.body;
      const userId = req.user.id;

      // Gate: user must own item ID 3 (Loa Truyền Âm)
      const hasMegaphone = await userHasMegaphone(userId);
      if (!hasMegaphone) {
        return res.status(403).json({
          message: "Bạn cần sở hữu 'Loa Truyền Âm' trong shop để phát tin!",
        });
      }

      const users = await UserModel.findById(userId);
      if (!users || users.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy thông tin tài khoản!" });
      }
      const dbUser = users[0];

      let displayName = dbUser.full_name || dbUser.username || `#${userId}`;
      const avatar = dbUser.avatar;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ message: "Nội dung truyền âm không được để trống!" });
      }
      if (message.length > 500) {
        return res.status(400).json({ message: "Nội dung truyền âm quá dài (tối đa 500 ký tự)!" });
      }

      const result = await ChatService.sendWorldMegaphoneItem(
        userId,
        dbUser.username,
        displayName,
        avatar,
        req.user.role,
        message,
      );

      res.json({ success: true, message: "Phát loa thành công!", data: result });
    } catch (error) {
      logger.error("sendMegaphoneItem error:", error);
      res.status(500).json({ message: error.message || "Lỗi server khi phát loa." });
    }
  },

  /**
   * Check if the current user can use the Megaphone (owns item ID 3)
   */
  getMegaphoneAccess: async (req, res) => {
    try {
      const hasAccess = await userHasMegaphone(req.user.id);
      res.json({ success: true, data: { hasAccess } });
    } catch (error) {
      logger.error("getMegaphoneAccess error:", error);
      res.status(500).json({ message: "Lỗi kiểm tra quyền loa." });
    }
  },

  /**
   * Get room history (DB for world, Redis for author rooms)
   */
  getRoomHistory: async (req, res) => {
    try {
      const roomId = req.params.roomId;
      const history = await ChatService.getRoomHistory(roomId);
      res.json({ success: true, data: history });
    } catch (error) {
      logger.error("getRoomHistory error:", error);
      res.status(500).json({ message: "Lỗi tải lịch sử chat." });
    }
  },

  /**
   * Get online user statistics
   */
  getOnlineStats: async (req, res) => {
    try {
      const worldCount = await onlineStatusService.getWorldOnlineCount();
      const loggedInCount = await onlineStatusService.getOnlineCount();
      let userIds = [];
      if (req.user && req.user.role === "admin") {
        userIds = await onlineStatusService.getOnlineUserIds();
      }
      res.json({ success: true, data: { count: worldCount, loggedInCount, userIds } });
    } catch (error) {
      logger.error("getOnlineStats error:", error);
      res.status(500).json({ message: "Lỗi server khi lấy thống kê online." });
    }
  },

  /**
   * Check online status for a list of user IDs
   */
  checkOnlineStatus: async (req, res) => {
    try {
      const { userIds } = req.body;
      if (!Array.isArray(userIds)) {
        return res.status(400).json({ message: "userIds phải là một mảng!" });
      }
      const statusMap = {};
      for (const userId of userIds) {
        statusMap[userId] = await onlineStatusService.isOnline(userId);
      }
      res.json({ success: true, data: statusMap });
    } catch (error) {
      logger.error("checkOnlineStatus error:", error);
      res.status(500).json({ message: "Lỗi server khi kiểm tra trạng thái online." });
    }
  },

  /**
   * Send a message to an Author's Room
   */
  sendAuthorMessage: async (req, res) => {
    try {
      const { message } = req.body;
      const authorId = req.params.authorId;
      const userId = req.user.id;

      const users = await UserModel.findById(userId);
      if (!users || users.length === 0) {
        logger.error(`User ${userId} not found in DB but has valid JWT!`);
        return res.status(404).json({ message: "Không tìm thấy thông tin tu sĩ!" });
      }
      const dbUser = users[0];

      let displayName = dbUser.full_name || dbUser.username;
      if (!displayName || displayName === "null") displayName = `Tu sĩ #${userId}`;

      const avatar = dbUser.avatar;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ message: "Nội dung truyền âm không được để trống!" });
      }

      const result = await ChatService.sendAuthorMessage(
        userId,
        dbUser.username,
        displayName,
        avatar,
        req.user.role,
        authorId,
        message,
      );

      res.json({ success: true, message: "Truyền âm tới tác giả thành công!", data: result });
    } catch (error) {
      logger.error("sendAuthorMessage error:", error);
      res.status(500).json({ message: error.message || "Lỗi server khi truyền âm tới phòng tác giả." });
    }
  },

  /**
   * Get Author room history from Redis
   */
  getAuthorRoomHistory: async (req, res) => {
    try {
      const authorId = req.params.authorId;
      const history = await ChatService.getAuthorRoomHistory(authorId);
      res.json({ success: true, data: history });
    } catch (error) {
      logger.error("getAuthorRoomHistory error:", error);
      res.status(500).json({ message: "Lỗi server khi lấy lịch sử chat phòng tác giả." });
    }
  },
};

module.exports = ChatController;
