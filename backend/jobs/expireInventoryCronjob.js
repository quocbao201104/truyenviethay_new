/**
 * Inventory Expiry Cron
 *
 * - user_inventory: Unequip các item đã hết hạn (expires_at < NOW)
 * - Đảm bảo item expired không còn hiển thị equipped
 * - Runtime đã block equip/use; cron dọn nền
 */
const cron = require("node-cron");
const db = require("../config/db");
const logger = require("../utils/logger");

const CRON_SCHEDULE = "0 2 * * *"; // 02:00 mỗi ngày (sau expireRewards 01:00)

async function runExpireInventory() {
  try {
    const [result] = await db.query(
      `UPDATE user_inventory
       SET is_equipped = 0
       WHERE expires_at IS NOT NULL
         AND expires_at <= UTC_TIMESTAMP()
         AND is_equipped = 1`
    );
    const affected = result?.affectedRows ?? 0;
    if (affected > 0) {
      logger.info(JSON.stringify({
        event: "expire",
        source: "inventory_unequip",
        unequipped_count: affected,
      }));
    }
    return { unequippedCount: affected };
  } catch (err) {
    logger.error("[ExpireInventory] Lỗi:", err.message);
    throw err;
  }
}

function startExpireInventoryCron() {
  cron.schedule(CRON_SCHEDULE, () => {
    runExpireInventory().catch((e) => logger.error("[ExpireInventory] Unexpected:", e));
  });
  logger.info(`[ExpireInventory] Cron đã đăng ký: chạy 02:00 mỗi ngày`);
}

module.exports = {
  runExpireInventory,
  startExpireInventoryCron,
  CRON_SCHEDULE,
};
