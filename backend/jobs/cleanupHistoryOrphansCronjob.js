/**
 * Reading History Orphan Cleanup Cron
 *
 * - lich_su_doc_new: Xóa rows truyện/chương đã bị xóa
 * - reading_state: Xóa rows truyện/chương đã bị xóa
 * - Optional: Cap 200 entries/user (giữ latest)
 */
const cron = require("node-cron");
const db = require("../config/db");
const logger = require("../utils/logger");

const CRON_SCHEDULE = "0 3 * * *"; // 03:00 mỗi ngày
const HISTORY_CAP_PER_USER = parseInt(process.env.HISTORY_CAP_PER_USER || "200", 10);

async function runCleanupOrphans() {
  try {
    // 1. Delete lich_su_doc_new orphans (truyen or chuong deleted)
    const [histResult] = await db.query(
      `DELETE lsd FROM lich_su_doc_new lsd
       LEFT JOIN truyen_new t ON lsd.truyen_id = t.id
       LEFT JOIN chuong c ON lsd.chuong_id = c.id
       WHERE t.id IS NULL OR c.id IS NULL`
    );
    const histDeleted = histResult?.affectedRows ?? 0;

    // 2. Delete reading_state orphans
    const [rsResult] = await db.query(
      `DELETE rs FROM reading_state rs
       LEFT JOIN truyen_new t ON rs.truyen_id = t.id
       LEFT JOIN chuong c ON rs.last_read_chuong_id = c.id
       WHERE t.id IS NULL OR c.id IS NULL`
    );
    const rsDeleted = rsResult?.affectedRows ?? 0;

    if (histDeleted > 0 || rsDeleted > 0) {
      logger.info(
        JSON.stringify({
          event: "cleanup",
          source: "history_orphans",
          lich_su_doc_deleted: histDeleted,
          reading_state_deleted: rsDeleted,
        })
      );
    }
    return { histDeleted, rsDeleted };
  } catch (err) {
    logger.error("[CleanupHistoryOrphans] Lỗi:", err.message);
    throw err;
  }
}

async function runCapHistoryPerUser() {
  if (HISTORY_CAP_PER_USER <= 0) return { capped: 0 };

  try {
    const [users] = await db.query(
      `SELECT user_id, COUNT(*) AS cnt
       FROM lich_su_doc_new
       GROUP BY user_id
       HAVING cnt > ?`,
      [HISTORY_CAP_PER_USER]
    );

    let totalDeleted = 0;
    for (const u of users) {
      const [keepRows] = await db.query(
        `SELECT id FROM lich_su_doc_new
         WHERE user_id = ?
         ORDER BY thoi_gian_doc DESC
         LIMIT ?`,
        [u.user_id, HISTORY_CAP_PER_USER]
      );
      const keepIds = keepRows.map((r) => r.id);
      if (keepIds.length === 0) continue;
      const placeholders = keepIds.map(() => "?").join(",");
      const [delResult] = await db.query(
        `DELETE FROM lich_su_doc_new WHERE user_id = ? AND id NOT IN (${placeholders})`,
        [u.user_id, ...keepIds]
      );
      totalDeleted += delResult?.affectedRows ?? 0;
    }

    if (totalDeleted > 0) {
      logger.info(
        JSON.stringify({
          event: "cleanup",
          source: "history_cap",
          users_affected: users.length,
          rows_deleted: totalDeleted,
          cap: HISTORY_CAP_PER_USER,
        })
      );
    }
    return { capped: totalDeleted };
  } catch (err) {
    logger.error("[CapHistoryPerUser] Lỗi:", err.message);
    throw err;
  }
}

async function run() {
  const orphans = await runCleanupOrphans();
  const capResult = await runCapHistoryPerUser();
  return { ...orphans, capped: capResult.capped };
}

function startCleanupHistoryCron() {
  cron.schedule(CRON_SCHEDULE, () => {
    run().catch((e) => logger.error("[CleanupHistoryOrphans] Unexpected:", e));
  });
  logger.info(`[CleanupHistoryOrphans] Cron đã đăng ký: 03:00 mỗi ngày (cap=${HISTORY_CAP_PER_USER})`);
}

module.exports = {
  run,
  runCleanupOrphans,
  runCapHistoryPerUser,
  startCleanupHistoryCron,
  CRON_SCHEDULE,
};
