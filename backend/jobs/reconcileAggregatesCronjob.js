/**
 * Reconcile Aggregates Cronjob (Phase 5)
 *
 * Định kỳ recompute luot_theo_doi và rating/rating_count/hot_score từ bảng nguồn
 * để sửa lệch do race condition hoặc lỗi trước khi dùng transaction.
 *
 * Chạy 1 lần/ngày (vd 02:00) — chạy khi traffic thấp.
 */

const db = require("../config/db");
const logger = require("../utils/logger");
const { invalidate } = require("../utils/cache");

const CRON_SCHEDULE = "0 2 * * *"; // 02:00 mỗi ngày

async function reconcileLuotTheoDoi() {
  const [result] = await db.query(`
    UPDATE truyen_new t
    LEFT JOIN (
      SELECT truyen_id, COUNT(*) AS cnt
      FROM theo_doi
      GROUP BY truyen_id
    ) td ON t.id = td.truyen_id
    SET t.luot_theo_doi = COALESCE(td.cnt, 0)
  `);
  logger.info(`[ReconcileAggregates] luot_theo_doi: updated ${result.affectedRows} rows`);
  return result.affectedRows;
}

async function reconcileRating() {
  const [result] = await db.query(`
    UPDATE truyen_new t
    INNER JOIN (
      SELECT
        truyen_id,
        AVG(rating) AS avg_rating,
        COUNT(*) AS rating_count
      FROM ratings
      GROUP BY truyen_id
    ) r ON t.id = r.truyen_id
    SET
      t.rating = r.avg_rating,
      t.rating_count = r.rating_count,
      t.hot_score = (r.avg_rating * 0.4) + (r.rating_count * 0.3) + (COALESCE(t.luot_xem, 0) * 0.3)
  `);
  logger.info(`[ReconcileAggregates] rating/rating_count: updated ${result.affectedRows} rows`);
  return result.affectedRows;
}

async function runReconcile() {
  logger.info("[ReconcileAggregates] Starting reconcile...");
  try {
    await reconcileLuotTheoDoi();
    await reconcileRating();
    await invalidate("topRated");
    logger.info("[ReconcileAggregates] Done. Cache topRated invalidated.");
  } catch (err) {
    logger.error("[ReconcileAggregates] Failed:", err.message);
    logger.error(err.stack);
    throw err;
  }
}

function startReconcileAggregatesCron() {
  const cron = require("node-cron");
  cron.schedule(CRON_SCHEDULE, () => {
    runReconcile().catch((e) => logger.error("[ReconcileAggregates] Unexpected:", e));
  });
  logger.info(`[ReconcileAggregates] Cronjob started: runs daily at 02:00 (${CRON_SCHEDULE})`);
}

module.exports = {
  runReconcile,
  reconcileLuotTheoDoi,
  reconcileRating,
  startReconcileAggregatesCron,
  CRON_SCHEDULE,
};
