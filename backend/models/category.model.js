// models/category.model.js
const db = require("../config/db");

const TheLoaiModel = {
  getAll: async () => {
    const [rows] = await db.query(`SELECT id_theloai, ten_theloai FROM theloai_new`);
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
  getByStoryIds: async (storyIds) => {
    if (!Array.isArray(storyIds) || storyIds.length === 0) return new Map();

    const ids = storyIds
      .map((id) => parseInt(id, 10))
      .filter((id) => Number.isFinite(id));
    if (ids.length === 0) return new Map();

    const placeholders = ids.map(() => "?").join(",");
    const [rows] = await db.query(
      `SELECT
         tt.truyen_id,
         t.id_theloai,
         t.ten_theloai
       FROM truyen_theloai tt
       INNER JOIN theloai_new t ON tt.theloai_id = t.id_theloai
       WHERE tt.truyen_id IN (${placeholders})
       ORDER BY tt.truyen_id ASC, t.ten_theloai ASC`,
      ids,
    );

    const genresByStoryId = new Map();
    for (const row of rows) {
      if (!genresByStoryId.has(row.truyen_id)) {
        genresByStoryId.set(row.truyen_id, []);
      }
      genresByStoryId.get(row.truyen_id).push({
        id_theloai: row.id_theloai,
        ten_theloai: row.ten_theloai,
      });
    }

    return genresByStoryId;
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
        AND (t.is_deleted = 0 OR t.is_deleted IS NULL)
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
