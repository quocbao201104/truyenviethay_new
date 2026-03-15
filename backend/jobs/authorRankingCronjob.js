/**
 * Author Ranking Cronjob
 *
 * Tính toán điểm xếp hạng tác giả mỗi ngày:
 * - total_views (từ truyen_new)
 * - weekly_score / monthly_score (từ daily_stats)
 * - potential_score / author_score (công thức)
 */

const db = require("../config/db");
const logger = require("../utils/logger");
const { invalidate } = require("../utils/cache");

const CRON_SCHEDULE = "0 0 * * *"; // 00:00 mỗi ngày

async function updateTotalViews(connection) {
  await connection.query(
    `UPDATE authors a
     LEFT JOIN (
       SELECT author_id, COALESCE(SUM(luot_xem), 0) AS total_views
       FROM truyen_new
       WHERE author_id IS NOT NULL AND is_deleted = 0
       GROUP BY author_id
     ) s ON a.id = s.author_id
     SET a.total_views = COALESCE(s.total_views, 0)`
  );
}

async function updateWeeklyScore(connection) {
  await connection.query(
    `UPDATE authors a
     LEFT JOIN (
       SELECT tn.author_id, COALESCE(SUM(ds.views_count), 0) AS weekly_views
       FROM daily_stats ds
       JOIN truyen_new tn ON ds.novel_id = tn.id
       WHERE ds.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
         AND tn.author_id IS NOT NULL AND tn.is_deleted = 0
       GROUP BY tn.author_id
     ) w ON a.id = w.author_id
     SET a.weekly_score = COALESCE(w.weekly_views, 0)`
  );
}

async function updateMonthlyScore(connection) {
  await connection.query(
    `UPDATE authors a
     LEFT JOIN (
       SELECT tn.author_id, COALESCE(SUM(ds.views_count), 0) AS monthly_views
       FROM daily_stats ds
       JOIN truyen_new tn ON ds.novel_id = tn.id
       WHERE ds.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         AND tn.author_id IS NOT NULL AND tn.is_deleted = 0
       GROUP BY tn.author_id
     ) m ON a.id = m.author_id
     SET a.monthly_score = COALESCE(m.monthly_views, 0)`
  );
}

async function updateDerivedScores(connection) {
  await connection.query(
    `UPDATE authors a
     LEFT JOIN (
       SELECT author_id, MIN(DATE(thoi_gian_tao)) AS first_story_date
       FROM truyen_new
       WHERE author_id IS NOT NULL AND is_deleted = 0 AND thoi_gian_tao IS NOT NULL
       GROUP BY author_id
     ) fs ON a.id = fs.author_id
     SET a.author_score = (a.total_views * 0.2) + (a.follower_count * 0.5) + (a.total_stories * 10),
         a.potential_score = (
           (a.total_views / GREATEST(DATEDIFF(CURDATE(), COALESCE(fs.first_story_date, DATE(a.created_at))) + 1, 1)) * 0.6
         ) + (a.follower_count * 0.4)`
  );
}

async function runAuthorRankingSync() {
  const connection = await db.getConnection();
  try {
    logger.info("[AuthorRanking] Starting recompute...");
    await connection.beginTransaction();
    await updateTotalViews(connection);
    await updateWeeklyScore(connection);
    await updateMonthlyScore(connection);
    await updateDerivedScores(connection);
    await connection.commit();
    await invalidate("rank:authors");
    logger.info("[AuthorRanking] Done.");
  } catch (err) {
    await connection.rollback();
    logger.error("[AuthorRanking] Failed:", err.message);
    logger.error(err.stack);
  } finally {
    connection.release();
  }
}

function startAuthorRankingCron() {
  const cron = require("node-cron");
  cron.schedule(CRON_SCHEDULE, () => {
    runAuthorRankingSync().catch((e) =>
      logger.error("[AuthorRanking] Unexpected:", e)
    );
  });
  logger.info(`[AuthorRanking] Cronjob started: runs daily at 00:00 (${CRON_SCHEDULE})`);
}

module.exports = {
  runAuthorRankingSync,
  startAuthorRankingCron,
  CRON_SCHEDULE,
};
