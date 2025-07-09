const db = require("../config/db");

const UserPoint = {
  getPointsByUserId: async (userId) => {
    try {
      const [rows] = await db.execute(
        "SELECT total_points, current_level_id, expiry_date FROM user_points WHERE user_id = ?",
        [userId]
      );
      if (rows.length === 0) {
        return null;
      }
      return rows[0];
    } catch (error) {
      throw new Error("Lỗi khi lấy điểm người dùng: " + error.message);
    }
  },

  createOrUpdate: async ({ user_id, points }) => {
    console.log("createOrUpdate:", { user_id, points });

    const [rows] = await db.execute(
      `INSERT INTO user_points (user_id, total_points) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE total_points = total_points + ?`,
      [user_id, points, points]
    );

    return rows;
  },

  updateCurrentLevel: async (userId, newLevelId) => {
    try {
      await db.execute(
        "UPDATE user_points SET current_level_id = ? WHERE user_id = ?",
        [newLevelId, userId]
      );
    } catch (error) {
      throw new Error("Lỗi khi cập nhật cấp bậc người dùng: " + error.message);
    }
  },
};

module.exports = UserPoint;
