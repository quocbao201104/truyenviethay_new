const db = require("../config/db");
const { getOrSet } = require("../utils/cache");

const Rating = {
  // Tạo hoặc cập nhật đánh giá (trong transaction)
  upsertRating: async (userId, truyenId, rating) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [existing] = await conn.query(
        `SELECT rating FROM ratings WHERE user_id = ? AND truyen_id = ?`,
        [userId, truyenId]
      );

      const isNew = existing.length === 0;
      const oldRating = isNew ? 0 : existing[0].rating;

      const [result] = await conn.query(
        `INSERT INTO ratings (user_id, truyen_id, rating)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE rating = ?, updated_at = CURRENT_TIMESTAMP`,
        [userId, truyenId, rating, rating]
      );

      if (isNew) {
        await conn.query(
          `UPDATE truyen_new 
           SET rating = ((rating * rating_count) + ?) / (rating_count + 1),
               rating_count = rating_count + 1,
               hot_score = (((rating * rating_count) + ?) / (rating_count + 1) * 0.4) + ((rating_count + 1) * 0.3) + (luot_xem * 0.3)
           WHERE id = ?`,
          [rating, rating, truyenId]
        );
      } else if (oldRating !== rating) {
        await conn.query(
          `UPDATE truyen_new 
           SET rating = ((rating * rating_count) - ? + ?) / rating_count,
               hot_score = (((rating * rating_count) - ? + ?) / rating_count * 0.4) + (rating_count * 0.3) + (luot_xem * 0.3)
           WHERE id = ? AND rating_count > 0`,
          [oldRating, rating, oldRating, rating, truyenId]
        );
      }

      await conn.commit();
      return result;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // Lấy tất cả đánh giá theo truyện
  getRatingsByTruyenId: async (truyenId) => {
    const [rows] = await db.query(
      `SELECT r.*, u.full_name FROM ratings r
       JOIN truyen_new t ON r.truyen_id = t.id
       JOIN users_new u ON r.user_id = u.id
       WHERE r.truyen_id = ?
         AND (t.is_deleted = 0 OR t.is_deleted IS NULL)
       ORDER BY r.created_at DESC`,
      [truyenId]
    );
    return rows;
  },

  // Lấy trung bình sao từ truyen_new
  getAverageRating: async (truyenId) => {
    const [rows] = await db.query(
      `SELECT rating AS avg_rating, rating_count AS total_ratings
       FROM truyen_new
       WHERE id = ?
         AND (is_deleted = 0 OR is_deleted IS NULL)`,
      [truyenId]
    );
    return rows[0];
  },

  //Lấy tất cả truyện có rating, sắp xếp theo rating trung bình
  getAllTopRatedStories: async ({ page = 1, limit = 50 } = {}) => {
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (safePage - 1) * safeLimit;
    const cacheKey = `topRated:${safePage}:${safeLimit}`;
    
    return getOrSet(
      cacheKey,
      600, // 10 minutes TTL
      async () => {
        const [rows] = await db.query(
          `SELECT 
            t.id,
            t.ten_truyen,
            t.slug,
            t.anh_bia,
            t.tac_gia,
            t.luot_xem,
            t.luot_thich,
            t.trang_thai,
            t.thoi_gian_cap_nhat,
            t.so_luong_chuong,
            t.so_luong_chuong AS so_chuong,
            t.chuong_moi,
            t.rating AS avg_rating,
            t.rating_count AS total_ratings
           FROM truyen_new t
           WHERE t.trang_thai_kiem_duyet = 'duyet'
             AND (t.is_deleted = 0 OR t.is_deleted IS NULL)
             AND t.so_luong_chuong > 0
             AND t.rating_count >= 1
           ORDER BY t.rating DESC, t.rating_count DESC
           LIMIT ? OFFSET ?`,
          [safeLimit, offset]
        );

        const [countResult] = await db.query(
          `SELECT COUNT(*) as total FROM truyen_new t 
           WHERE t.trang_thai_kiem_duyet = 'duyet'
             AND (t.is_deleted = 0 OR t.is_deleted IS NULL)
             AND t.so_luong_chuong > 0
             AND t.rating_count >= 1`
        );

        return {
          data: rows,
          pagination: {
            total: countResult[0]?.total || 0,
            current_page: safePage,
            total_pages: Math.ceil((countResult[0]?.total || 0) / safeLimit) || 1,
            limit: safeLimit,
          }
        };
      }
    );
  },

};

module.exports = Rating;
