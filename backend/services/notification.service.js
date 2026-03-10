const db = require("../config/db");
const { getIO } = require("../config/socket");
const logger = require("../utils/logger");

const NotificationService = {
  /**
   * Send notification to a specific user
   */
  send: async (userId, content, targetId, type) => {
    try {
      // 1. Save to MySQL
      const [result] = await db.query(
        "INSERT INTO thong_bao (user_id, content, target_id, type, is_read, created_at) VALUES (?, ?, ?, ?, 0, NOW())",
        [userId, content, targetId, type]
      );

      const notificationData = {
        id: result.insertId,
        user_id: userId,
        content,
        target_id: targetId,
        type,
        is_read: 0,
        created_at: new Date()
      };

      // 2. Broadcast via Socket.io
      const io = getIO();
      io.to(`user_notification_${userId}`).emit("new_notification", notificationData);

      return notificationData;
    } catch (err) {
      logger.error("NotificationService.send error:", err);
      throw err;
    }
  },

  /**
   * Send system-wide notification to all online users
   */
  sendSystemNotice: async (content) => {
    try {
      // For system notices, we often just broadcast without per-user DB entry
      // unless it's meant to be persistent for everyone.
      // If persistent, we might need a separate 'system_notices' table or batch insert.
      const io = getIO();
      io.emit("system_notification", {
        content,
        type: 'system',
        created_at: new Date()
      });
      
      logger.info("System notification broadcasted.");
    } catch (err) {
      logger.error("NotificationService.sendSystemNotice error:", err);
    }
  }
};

module.exports = NotificationService;
