const db = require("../config/db");

const StoryModel = {
  // Tạo truyện mới
  create: async (storyData) => {
    const [result] = await db.query(
      `INSERT INTO truyen_new (
        ten_truyen, slug, tac_gia, mo_ta, trang_thai, tinh_trang, trang_thai_viet,
        yeu_to_nhay_cam, link_nguon, muc_tieu, doi_tuong_doc_gia,
        thoi_gian_cap_nhat, anh_bia, trang_thai_kiem_duyet, user_id,
        ghi_chu_admin, danh_gia_noi_dung, danh_gia_van_phong, danh_gia_sang_tao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        storyData.ten_truyen,
        storyData.slug,
        storyData.tac_gia,
        storyData.mo_ta,
        storyData.trang_thai,
        storyData.tinh_trang,
        storyData.trang_thai_viet,
        storyData.yeu_to_nhay_cam,
        storyData.link_nguon,
        storyData.muc_tieu,
        storyData.doi_tuong_doc_gia,
        storyData.thoi_gian_cap_nhat,
        storyData.anh_bia,
        storyData.trang_thai_kiem_duyet,
        storyData.user_id,
        storyData.ghi_chu_admin,
        storyData.danh_gia_noi_dung,
        storyData.danh_gia_van_phong,
        storyData.danh_gia_sang_tao,
      ]
    );
    return result.insertId;
  },
  // Lấy tất cả truyện (Admin)
  getAll: async () => {
    const [rows] = await db.query(`SELECT * FROM truyen_new`);
    return rows;
  },
  // Lấy truyện theo userId (Admin)
  getById: async (id) => {
    const [rows] = await db.query(`SELECT * FROM truyen_new WHERE id = ?`, [
      id,
    ]);
    return rows[0];
  },
  // Lấy truyện theo slug (dùng cho frontend)
  getBySlug: async (slug) => {
    const [rows] = await db.query(`SELECT * FROM truyen_new WHERE slug = ?`, [
      slug,
    ]);
    return rows[0];
  },

  getFollowers: async (storyId) => {
    const [followers] = await db.query(
      "SELECT user_id FROM theo_doi WHERE truyen_id = ?",
      [storyId]
    );
    return followers;
  },

  update: async (id, storyData) => {
    const [result] = await db.query(
      `UPDATE truyen_new SET 
        ten_truyen = ?, 
        tac_gia = ?, 
        mo_ta = ?, 
        trang_thai = ?, 
        anh_bia = ?, 
        thoi_gian_cap_nhat = NOW()
      WHERE id = ?`,
      [
        storyData.ten_truyen,
        storyData.tac_gia,
        storyData.mo_ta,
        storyData.trang_thai,
        storyData.anh_bia,
        id,
      ]
    );
    return result.affectedRows;
  },

  getPendingApproval: async () => {
    const [rows] = await db.query(
      `SELECT * FROM truyen_new WHERE trang_thai_kiem_duyet = 'cho_duyet'`
    );
    return rows;
  },

  getByAuthor: async (userId) => {
    if (!userId || isNaN(userId)) {
      throw new Error("ID người dùng không hợp lệ");
    }
    const [rows] = await db.query(
      `SELECT * FROM truyen_new WHERE user_id = ?`,
      [userId]
    );
    return rows;
  },

  delete: async (id) => {
    const [result] = await db.query(`DELETE FROM truyen_new WHERE id = ?`, [
      id,
    ]);
    return result.affectedRows;
  },

  addGenresForStory: async (truyenId, theloaiIds) => {
    const values = theloaiIds.map((id) => [truyenId, id]);
    await db.query(
      `INSERT INTO truyen_theloai (truyen_id, theloai_id) VALUES ?`,
      [values]
    );
  },
};

module.exports = StoryModel;
