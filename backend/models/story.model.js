const db = require("../config/db");

const StoryModel = {
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

  getAll: async ({
    page = 1,
    limit = 10,
    trang_thai_kiem_duyet = "",
    keyword = "",
    author_id = null,
    category_id = null,
    sort_by = "thoi_gian_cap_nhat",
    order = "DESC",
  }) => {
    const offset = (page - 1) * limit;
    let query = `
        SELECT tn.*, u.username AS ten_tac_gia
        FROM truyen_new tn
        LEFT JOIN users_new u ON tn.user_id = u.id
    `;
    let countQuery = `
        SELECT COUNT(*) AS total
        FROM truyen_new tn
        LEFT JOIN users_new u ON tn.user_id = u.id
    `;
    const params = [];
    const countParams = [];
    const whereClauses = [];

    if (trang_thai_kiem_duyet) {
      whereClauses.push(`tn.trang_thai_kiem_duyet = ?`);
      params.push(trang_thai_kiem_duyet);
      countParams.push(trang_thai_kiem_duyet);
    }

    if (keyword) {
      whereClauses.push(`(tn.ten_truyen LIKE ? OR tn.tac_gia LIKE ?)`);
      params.push(`%${keyword}%`, `%${keyword}%`);
      countParams.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (author_id) {
      whereClauses.push(`tn.user_id = ?`);
      params.push(author_id);
      countParams.push(author_id);
    }

    if (category_id) {
      query = `
            SELECT tn.*, u.username AS ten_tac_gia
            FROM truyen_new tn
            LEFT JOIN users_new u ON tn.user_id = u.id
            INNER JOIN truyen_theloai tt ON tn.id = tt.truyen_id
        `;
      countQuery = `
            SELECT COUNT(DISTINCT tn.id) AS total
            FROM truyen_new tn
            LEFT JOIN users_new u ON tn.user_id = u.id
            INNER JOIN truyen_theloai tt ON tn.id = tt.truyen_id
        `;
      whereClauses.push(`tt.theloai_id = ?`);
      params.push(category_id);
      countParams.push(category_id);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(" AND ");
      countQuery += ` WHERE ` + whereClauses.join(" AND ");
    }

    const sortField = ["ten_truyen", "luot_xem", "thoi_gian_cap_nhat", "id"].includes(sort_by)
        ? `tn.${sort_by}`
        : "tn.thoi_gian_cap_nhat";
    const sortOrder = order && order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    query += ` ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(+limit, +offset);

    const [stories] = await db.query(query, params);
    const [countResult] = await db.query(countQuery, countParams);

    return {
      data: stories,
      pagination: {
        total: countResult[0].total,
        current_page: +page,
        total_pages: Math.ceil(countResult[0].total / limit),
      },
    };
  },
  
  getById: async (id) => {
    // Lấy tất cả các cột từ truyen_new và noi_dung_chuong_mau từ bảng chuong
    const [rows] = await db.query(
      `SELECT tn.*, c.noi_dung_chuong_mau AS sample_chapter_content
       FROM truyen_new tn
       LEFT JOIN chuong c ON tn.id = c.truyen_id AND c.is_chuong_mau = 1
       WHERE tn.id = ?`,
      [id]
    );
    return rows[0]; 
  },

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

  getPublicStories: async ({
    page = 1,
    limit = 20,
    sort_by = "thoi_gian_cap_nhat",
    order = "DESC",
    keyword = "",
  }) => {
    const offset = (page - 1) * limit;
    const sortField = ["ten_truyen", "luot_xem", "thoi_gian_cap_nhat"].includes(
      sort_by
    )
      ? sort_by
      : "thoi_gian_cap_nhat";
    const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const whereClause = `WHERE trang_thai_kiem_duyet = 'duyet' AND ten_truyen LIKE ?`;

    const [data] = await db.query(
      `SELECT id, ten_truyen, tac_gia, slug, mo_ta, anh_bia, luot_xem, thoi_gian_cap_nhat
       FROM truyen_new
       ${whereClause}
       ORDER BY ${sortField} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [`%${keyword}%`, +limit, +offset]
    );

    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM truyen_new ${whereClause}`,
      [`%${keyword}%`]
    );

    return {
      data,
      pagination: {
        total: countResult[0].total,
        current_page: +page,
        total_pages: Math.ceil(countResult[0].total / limit),
      },
    };
  },
};

module.exports = StoryModel;