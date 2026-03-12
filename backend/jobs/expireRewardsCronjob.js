/**
 * Gamification Expiry Cron
 *
 * - user_rewards: Chuyển status sang 'expired' cho quà đã hết hạn (expired_at < NOW)
 * - Không xóa dữ liệu, chỉ cập nhật status để UI hiển thị đúng
 */
const cron = require("node-cron");
const db = require("../config/db");
const logger = require("../utils/logger");
const { REWARD_STATUS } = require("../constants/rewardContract");

const CRON_SCHEDULE = "0 1 * * *"; // 01:00 mỗi ngày

async function runExpireRewards() {
  try {
    const [result] = await db.query(
      `UPDATE user_rewards
       SET status = ?
       WHERE expired_at IS NOT NULL
         AND expired_at < UTC_TIMESTAMP()
         AND status = ?`,
      [REWARD_STATUS.EXPIRED, REWARD_STATUS.UNLOCKED]
    );
    const affected = result?.affectedRows ?? 0;
    if (affected > 0) {
      logger.info(`[ExpireRewards] Đã chuyển ${affected} quà sang status expired`);
    }
    return { expiredCount: affected };
  } catch (err) {
    logger.error("[ExpireRewards] Lỗi:", err.message);
    throw err;
  }
}

function startExpireRewardsCron() {
  cron.schedule(CRON_SCHEDULE, () => {
    runExpireRewards().catch((e) => logger.error("[ExpireRewards] Unexpected:", e));
  });
  logger.info(`[ExpireRewards] Cron đã đăng ký: chạy 01:00 mỗi ngày`);
}

module.exports = {
  runExpireRewards,
  startExpireRewardsCron,
  CRON_SCHEDULE,
};
