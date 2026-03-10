const ChatService = require("../services/chat.service");
const onlineStatusService = require("../services/onlineStatus.service");
const UserModel = require("../models/user.model");
const logger = require("../utils/logger");

const ChatController = {
  /**
   * Send Megaphone message (World Chat)
   */
  sendMegaphone: async (req, res) => {
    try {
      const { message } = req.body;
      const userId = req.user.id;

      const users = await UserModel.findById(userId);
      if (!users || users.length === 0) {
        logger.error(`User ${userId} not found in DB but has valid JWT!`);
        return res
          .status(404)
          .json({ message: "KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin tu sÄ©!" });
      }
      const dbUser = users[0];

      // DEBUG LOG - help trace why name is "PhÃ m NhÃ¢n"
      logger.info(
        `[CHAT_DEBUG] UserID: ${userId} | DB_Username: "${dbUser.username}" | DB_FullName: "${dbUser.full_name}" | LevelID: ${dbUser.level_id}`,
      );

      // Priority: full_name -> username -> User ID fallback
      let displayName = dbUser.full_name || dbUser.username;
      if (!displayName || displayName === "null") {
        displayName = `Tu sÄ© #${userId}`;
      }

      const avatar = dbUser.avatar;

      if (!message || message.trim().length === 0) {
        return res
          .status(400)
          .json({
            message: "Ná»™i dung truyá»n Ã¢m khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng!",
          });
      }

      if (message.length > 500) {
        return res
          .status(400)
          .json({
            message:
              "Ná»™i dung truyá»n Ã¢m quÃ¡ dÃ i (tá»‘i Ä‘a 500 kÃ½ tá»±)!",
          });
      }

      const result = await ChatService.sendWorldMegaphone(
        userId,
        dbUser.username,
        displayName,
        avatar,
        message,
      );

      res.json({
        success: true,
        message: "Truyá»n Ã¢m thÃ nh cÃ´ng!",
        data: result,
      });
    } catch (error) {
      logger.error("sendMegaphone error:", error);
      res
        .status(500)
        .json({ message: error.message || "Lá»—i server khi truyá»n Ã¢m." });
    }
  },

  /**
   * Get room history from Redis
   */
  getRoomHistory: async (req, res) => {
    try {
      const roomId = req.params.roomId;
      const history = await ChatService.getRoomHistory(roomId);
      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      logger.error("getRoomHistory error:", error);
      res.status(500).json({ message: "........." });
    }
  },

  /**
   * Get online user statistics
   */
  getOnlineStats: async (req, res) => {
    try {
      const loggedInCount = await onlineStatusService.getOnlineCount();
      // Optional: Get full list if user is admin
      let userIds = [];
      if (req.user && req.user.role === "admin") {
        userIds = await onlineStatusService.getOnlineUserIds();
      }

      res.json({
        success: true,
        data: {
          count: loggedInCount, // Real online users (unique logged-in users)
          loggedInCount,
          userIds,
        },
      });
    } catch (error) {
      logger.error("getOnlineStats error:", error);
      res
        .status(500)
        .json({ message: "Lá»—i server khi láº¥y thá»‘ng kÃª online." });
    }
  },

  /**
   * Check online status for a list of user IDs
   */
  checkOnlineStatus: async (req, res) => {
    try {
      const { userIds } = req.body;
      if (!Array.isArray(userIds)) {
        return res
          .status(400)
          .json({ message: "userIds pháº£i lÃ  má»™t máº£ng!" });
      }

      const statusMap = {};
      for (const userId of userIds) {
        statusMap[userId] = await onlineStatusService.isOnline(userId);
      }

      res.json({
        success: true,
        data: statusMap,
      });
    } catch (error) {
      logger.error("checkOnlineStatus error:", error);
      res
        .status(500)
        .json({ message: "Lá»—i server khi kiá»ƒm tra tráº¡ng thÃ¡i online." });
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
        return res
          .status(404)
          .json({ message: "KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin tu sÄ©!" });
      }
      const dbUser = users[0];

      // DEBUG LOG
      logger.info(
        `[AUTHOR_CHAT_DEBUG] UserID: ${userId} | DB_Username: "${dbUser.username}" | DB_FullName: "${dbUser.full_name}" | LevelID: ${dbUser.level_id}`,
      );

      let displayName = dbUser.full_name || dbUser.username;
      if (!displayName || displayName === "null") {
        displayName = `Tu sÄ© #${userId}`;
      }

      const avatar = dbUser.avatar;

      if (!message || message.trim().length === 0) {
        return res
          .status(400)
          .json({
            message: "Ná»™i dung truyá»n Ã¢m khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng!",
          });
      }

      const result = await ChatService.sendAuthorMessage(
        userId,
        dbUser.username,
        displayName,
        avatar,
        authorId,
        message,
      );

      res.json({
        success: true,
        message: "Truyá»n Ã¢m tá»›i tÃ¡c giáº£ thÃ nh cÃ´ng!",
        data: result,
      });
    } catch (error) {
      logger.error("sendAuthorMessage error:", error);
      res
        .status(500)
        .json({
          message:
            error.message ||
            "Lá»—i server khi truyá»n Ã¢m tá»›i phÃ²ng tÃ¡c giáº£.",
        });
    }
  },

  /**
   * Get Author room history from Redis
   */
  getAuthorRoomHistory: async (req, res) => {
    try {
      const authorId = req.params.authorId;
      const history = await ChatService.getAuthorRoomHistory(authorId);
      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      logger.error("getAuthorRoomHistory error:", error);
      res
        .status(500)
        .json({
          message: "Lá»—i server khi láº¥y lá»‹ch sá»­ chat phÃ²ng tÃ¡c giáº£.",
        });
    }
  },
};

module.exports = ChatController;
