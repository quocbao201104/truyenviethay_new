const db = require("../config/db");

const ChapterModel = {
  // Thêm chương mới cho truyện (do tác giả đăng)
  createChapter: async ({ truyen_id, so_chuong, tieu_de, noi_dung, slug }) => {
    const thoi_gian_dang = new Date();
    const [result] = await db.execute(
      `INSERT INTO chuong (
        truyen_id, so_chuong, tieu_de, noi_dung, slug,
        thoi_gian_dang, trang_thai, is_chuong_mau
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        truyen_id,
        so_chuong,
        tieu_de,
        noi_dung,
        slug,
        thoi_gian_dang,
        "cho_duyet", // mặc định chờ duyệt
        0, // không phải chương mẫu
      ]
    );
    return { chapter_id: result.insertId };
  },

  // Lấy danh sách chương theo truyện (có phân trang)
  getChaptersByStoryId: async (truyen_id, limit, offset) => {
    const [rows] = await db.execute(
      `SELECT * FROM chuong 
       WHERE truyen_id = ? AND is_chuong_mau = 0
       ORDER BY so_chuong ASC
       LIMIT ? OFFSET ?`,
      [truyen_id, limit, offset]
    );
    return rows;
  },

  // Lấy chi tiết chương theo ID
  getChapterById: async (chapter_id) => {
    const [rows] = await db.execute(`SELECT * FROM chuong WHERE id = ?`, [
      chapter_id,
    ]);
    return rows[0];
  },

  getChapterBySlug: async (slug) => {
    const [rows] = await db.execute(
      "SELECT * FROM chuong WHERE slug = ? LIMIT 1",
      [slug]
    );
    return rows[0];
  },

  // Cập nhật chương
  updateChapter: async (id, { tieu_de, noi_dung, so_chuong, slug }) => {
    const [result] = await db.execute(
      `UPDATE chuong 
       SET tieu_de = ?, noi_dung = ?, so_chuong = ?, slug = ? 
       WHERE id = ?`,
      [tieu_de, noi_dung, so_chuong, slug, id]
    );
    return result.affectedRows;
  },

  // Xóa chương
  deleteChapter: async (id) => {
    const [result] = await db.execute(`DELETE FROM chuong WHERE id = ?`, [id]);
    return result.affectedRows;
  },

  // Thêm chương mẫu (giữ nguyên)
  createSampleChapter: async (chapterData) => {
    await db.query(
      `INSERT INTO chuong (
        truyen_id, so_chuong, tieu_de, noi_dung_chuong_mau,
        thoi_gian_dang, trang_thai, is_chuong_mau
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        chapterData.truyen_id,
        0,
        "Chương mẫu",
        chapterData.noi_dung,
        chapterData.thoi_gian_dang,
        "chuong_mau",
        1,
      ]
    );
  },
};

module.exports = ChapterModel;
