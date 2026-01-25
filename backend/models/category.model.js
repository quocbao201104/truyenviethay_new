// models/category.model.js
const db = require("../config/db");

const TheLoaiModel = {
  getAll: async () => {
    const [rows] = await db.query(`SELECT id_theloai, ten_theloai, thumbnail_url FROM theloai_new`);
    return rows;
  },
  // Lấy thể loại theo truyện
  getByStoryId: async (storyId) => {
    const [rows] = await db.query(
      `SELECT t.id_theloai, t.ten_theloai
           FROM truyen_theloai tt
           JOIN theloai_new t ON tt.theloai_id = t.id_theloai
           WHERE tt.truyen_id = ?`,
      [storyId]
    );
    return rows;
  },
  // Lọc truyện theo nhiều thể loại
  filterByGenreIds: async (genreIds, offset, limit) => {
    const placeholders = genreIds.map(() => "?").join(",");
    const [rows] = await db.query(
      `
      SELECT t.*
      FROM truyen_new t
      JOIN truyen_theloai tt ON t.id = tt.truyen_id
      WHERE tt.theloai_id IN (${placeholders})
        AND t.trang_thai_kiem_duyet = 'duyet'
      GROUP BY t.id
      HAVING COUNT(DISTINCT tt.theloai_id) = ?
      ORDER BY t.thoi_gian_cap_nhat DESC
      LIMIT ? OFFSET ?
      `,
      [...genreIds, genreIds.length, limit, offset]
    );
    return rows;
  },
};

module.exports = TheLoaiModel;