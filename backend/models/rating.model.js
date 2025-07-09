const db = require("../config/db");

const Rating = {
  // Tạo hoặc cập nhật đánh giá
  upsertRating: async (userId, truyenId, rating, comment) => {
    const [result] = await db.execute(
      `INSERT INTO ratings (user_id, truyen_id, rating, comment)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP`,
      [userId, truyenId, rating, comment, rating, comment]
    );
    return result;
  },

  // Lấy tất cả đánh giá theo truyện
  getRatingsByTruyenId: async (truyenId) => {
    const [rows] = await db.execute(
      `SELECT r.*, u.full_name FROM ratings r
       JOIN users_new u ON r.user_id = u.id
       WHERE r.truyen_id = ? ORDER BY r.created_at DESC`,
      [truyenId]
    );
    return rows;
  },

  // Tính trung bình sao
  getAverageRating: async (truyenId) => {
    const [rows] = await db.execute(
      `SELECT AVG(rating) AS avg_rating, COUNT(*) AS total_ratings
       FROM ratings WHERE truyen_id = ?`,
      [truyenId]
    );
    return rows[0];
  },
};

module.exports = Rating;
