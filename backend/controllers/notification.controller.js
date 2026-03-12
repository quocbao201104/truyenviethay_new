const db = require("../config/db");

const NotificationController = {
  // Get notifications for the logged-in user
  getNotifications: async (req, res) => {
    try {
      const { CATEGORY_MAP } = require("../constants/notification.constants");
      const userId = req.user.id;
      const { category, last_id } = req.query; // last_id for keyset pagination
      const limit = parseInt(req.query.limit) || 20;

      let typeFilter = "";
      if (category && CATEGORY_MAP[category]) {
        const types = CATEGORY_MAP[category].join(",");
        typeFilter = `AND type IN (${types})`;
      }

      // Keyset pagination: If last_id is provided, get notifications older than last_id
      let keysetFilter = "";
      const queryParams = [userId];
      if (last_id) {
        keysetFilter = `AND id < ?`;
        queryParams.push(parseInt(last_id));
      }
      queryParams.push(limit);

      const query = `
        SELECT id, user_id, content, is_read, type, target_id, created_at
        FROM thong_bao 
        WHERE user_id = ? ${typeFilter} ${keysetFilter}
        ORDER BY id DESC 
        LIMIT ?
      `;

      const [notifications] = await db.query(query, queryParams);

      const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM thong_bao WHERE user_id = ? ${typeFilter}`,
        [userId]
      );
      
      const [unreadResult] = await db.query(
        `SELECT COUNT(*) as unread FROM thong_bao WHERE user_id = ? AND is_read = 0 ${typeFilter}`,
        [userId]
      );

      res.status(200).json({
        success: true,
        data: notifications,
        pagination: {
          total: countResult[0].total,
          limit,
          last_id: notifications.length > 0 ? notifications[notifications.length - 1].id : null,
          hasMore: notifications.length === limit
        },
        unreadCount: unreadResult[0].unread
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Lỗi khi lấy thông báo", error: error.message });
    }
  },

  // Mark a single notification as read
  markAsRead: async (req, res) => {
    try {
      const userId = req.user.id;
      const notificationId = req.params.id;

      // Access control: only mark own notifications
      const [rows] = await db.query(
        `SELECT id FROM thong_bao WHERE id = ? AND user_id = ?`,
        [notificationId, userId]
      );

      if (rows.length === 0) {
        return res.status(403).json({ message: "Không có quyền truy cập thông báo này" });
      }

      await db.query(
        `UPDATE thong_bao SET is_read = 1 WHERE id = ? AND user_id = ?`,
        [notificationId, userId]
      );

      res.status(200).json({ success: true, message: "Đã đánh dấu đã đọc" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Lỗi khi cập nhật trạng thái", error: error.message });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.id;

      await db.query(
        `UPDATE thong_bao SET is_read = 1 WHERE user_id = ? AND is_read = 0`,
        [userId]
      );

      res.status(200).json({ success: true, message: "Đã đánh dấu tất cả là đã đọc" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Lỗi khi cập nhật trạng thái", error: error.message });
    }
  }
};

module.exports = NotificationController;
