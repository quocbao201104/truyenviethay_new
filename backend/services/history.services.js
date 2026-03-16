const db = require("../config/db");
const readingStateModel = require("../models/readingState.model");

const DEFAULT_LIMIT = 18;
const MAX_LIMIT = 100;
const MIN_LIMIT = 1;

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

exports.getReadingHistory = async (userId, page = 1, limit = DEFAULT_LIMIT) => {
  const safeLimit = clamp(parseInt(limit, 10) || DEFAULT_LIMIT, MIN_LIMIT, MAX_LIMIT);
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (safePage - 1) * safeLimit;

  const [countResult] = await db.query(
    `
    SELECT COUNT(DISTINCT truyen_id) AS total 
    FROM lich_su_doc_new 
    WHERE user_id = ?
  `,
    [userId]
  );
  const totalItems = countResult[0].total;
  const totalPages = Math.ceil(totalItems / safeLimit) || 1;

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
    [userId, userId, safeLimit, offset]
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
      last_read_chuong_id: row.chuong_id,
      thoi_gian_doc: row.thoi_gian_doc && typeof row.thoi_gian_doc === 'string' 
        ? row.thoi_gian_doc.replace(" ", "T") + "Z" 
        : row.thoi_gian_doc,
    });
  }
  return {
    data: history,
    pagination: {
      current_page: safePage,
      total_pages: totalPages,
      total: totalItems,
      limit: safeLimit,
    },
  };
};

/**
 * Save reading history: concurrency-safe UPSERT.
 * Requires unique (user_id, truyen_id, chuong_id) on lich_su_doc_new (migration 19).
 * Also updates reading_state (canonical last-read per user, story).
 */
exports.saveReadingHistory = async (userId, truyenId, chuongId) => {
  const now = new Date();

  await db.query(
    `INSERT INTO lich_su_doc_new (user_id, truyen_id, chuong_id, thoi_gian_doc)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE thoi_gian_doc = VALUES(thoi_gian_doc)`,
    [userId, truyenId, chuongId, now]
  );

  await readingStateModel.upsert(userId, truyenId, chuongId);

  return { success: true };
};
