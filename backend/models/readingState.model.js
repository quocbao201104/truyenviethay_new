const db = require("../config/db");

/**
 * Upsert reading state: last_read_chuong_id, last_read_at per (user_id, truyen_id)
 * Unique PK (user_id, truyen_id) - one row per user per story
 */
exports.upsert = async (userId, truyenId, chuongId) => {
  const now = new Date();
  await db.query(
    `INSERT INTO reading_state (user_id, truyen_id, last_read_chuong_id, last_read_at)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE last_read_chuong_id = VALUES(last_read_chuong_id), last_read_at = VALUES(last_read_at)`,
    [userId, truyenId, chuongId, now]
  );
};

/**
 * Get last-read chapter for (user, story)
 */
exports.getByUserAndStory = async (userId, truyenId) => {
  const [rows] = await db.query(
    `SELECT last_read_chuong_id, last_read_at FROM reading_state WHERE user_id = ? AND truyen_id = ?`,
    [userId, truyenId]
  );
  return rows[0] || null;
};

/**
 * Get last-read for multiple stories (batch, for list responses)
 */
exports.getByUserAndStories = async (userId, truyenIds) => {
  if (!truyenIds || truyenIds.length === 0) return [];
  const placeholders = truyenIds.map(() => "?").join(",");
  const [rows] = await db.query(
    `SELECT truyen_id, last_read_chuong_id, last_read_at FROM reading_state WHERE user_id = ? AND truyen_id IN (${placeholders})`,
    [userId, ...truyenIds]
  );
  return rows;
};
