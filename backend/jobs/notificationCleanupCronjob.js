const cron = require('node-cron');
const db = require('../config/db');
const logger = require('../utils/logger');

/**
 * Lên lịch dọn dẹp thông báo cũ
 * Quy tắc:
 * 1. Xóa thông báo đã đọc sau 7 ngày.
 * 2. Xóa tất cả thông báo sau 30 ngày (bất kể đã đọc hay chưa).
 */
const startNotificationCleanupCron = () => {
    // Lên lịch chạy vào 00:00 mỗi Chủ Nhật hàng tuần (At 00:00 on Sunday)
    cron.schedule('0 0 * * 0', async () => {
        logger.info("--- Bắt đầu pháp trận dọn dẹp thông báo ---");
        try {
            const query = `
                DELETE FROM thong_bao 
                WHERE (is_read = 1 AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)) 
                   OR created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
            `;
            
            const [result] = await db.query(query);
            logger.info(`Đã dọn dẹp xong. Số bản ghi bị xóa: ${result.affectedRows}`);
        } catch (error) {
            logger.error("Lỗi khi chạy Cron Job dọn dẹp:", error);
        }
    }, {
        timezone: "Asia/Ho_Chi_Minh" // Đảm bảo chạy đúng giờ Việt Nam
    });

    logger.info("Notification Cleanup Cron Job đã được đăng ký (Chạy 00:00 Chủ Nhật).");
};

module.exports = { startNotificationCleanupCron };
