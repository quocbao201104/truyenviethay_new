const db = require("../config/db");
const formatTimeAgo = require("../utils/time");

const LIMIT = 18;

exports.getReadingHistory = async (userId, page) => {
  const offset = (page - 1) * LIMIT;

  const [countResult] = await db.query(
    `
    SELECT COUNT(DISTINCT truyen_id) AS total 
    FROM lich_su_doc_new 
    WHERE user_id = ?
  `,
    [userId]
  );
  const totalItems = countResult[0].total;
  const totalPages = Math.ceil(totalItems / LIMIT);

  const [rows] = await db.query(
    `
    SELECT 
      lsd.truyen_id,
      lsd.chuong_id,
      lsd.thoi_gian_doc,
      t.ten_truyen,
      t.slug as truyen_slug,
      t.anh_bia,
      c.so_chuong,
      c.slug as chuong_slug
    FROM lich_su_doc_new lsd
    JOIN truyen_new t ON lsd.truyen_id = t.id
    LEFT JOIN chuong c ON lsd.chuong_id = c.id
    INNER JOIN (
      SELECT truyen_id, MAX(thoi_gian_doc) AS max_time
      FROM lich_su_doc_new
      WHERE user_id = ?
      GROUP BY truyen_id
    ) recent ON lsd.truyen_id = recent.truyen_id AND lsd.thoi_gian_doc = recent.max_time
    WHERE lsd.user_id = ?
    ORDER BY lsd.thoi_gian_doc DESC
    LIMIT ? OFFSET ?
    `,
    [userId, userId, LIMIT, offset]
  );

  const history = [];

  for (const row of rows) {
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
    const anhBia = row.anh_bia && row.anh_bia.startsWith("http") 
      ? row.anh_bia 
      : row.anh_bia 
        ? `${BASE_URL}/uploads_img/bia_truyen/${row.anh_bia}`
        : `${BASE_URL}/uploads_img/bia_truyen/bia_truyen_default.jpg`;

    const so_chuong = row.so_chuong || null;

    history.push({
      truyen_id: row.truyen_id,
      truyen_slug: row.truyen_slug,
      ten_truyen: row.ten_truyen,
      anh_bia: anhBia,
      chuong_moi_nhat: so_chuong ? `Chương ${so_chuong}` : "Không có chương",
      chuong_moi_nhat_so_chuong: so_chuong,
      chuong_slug: row.chuong_slug,
      thoi_gian_doc: row.thoi_gian_doc, // Return raw timestamp for frontend formatting
    });
  }
  return {
    history,
    total_pages: totalPages,
    current_page: page,
  };
};

exports.saveReadingHistory = async (userId, truyenId, chuongId) => {
  const [existing] = await db.query(
    `SELECT id FROM lich_su_doc_new 
     WHERE user_id = ? AND truyen_id = ? AND chuong_id = ?`,
    [userId, truyenId, chuongId]
  );

  if (existing.length > 0) {
    // Update existing record
    await db.query(
      `UPDATE lich_su_doc_new 
       SET thoi_gian_doc = ? 
       WHERE user_id = ? AND truyen_id = ? AND chuong_id = ?`,
      [new Date(), userId, truyenId, chuongId]
    );
  } else {
    // Insert new record
    await db.query(
      `INSERT INTO lich_su_doc_new (user_id, truyen_id, chuong_id, thoi_gian_doc) 
       VALUES (?, ?, ?, ?)`,
      [userId, truyenId, chuongId, new Date()]
    );
  }

  return { success: true };
};
