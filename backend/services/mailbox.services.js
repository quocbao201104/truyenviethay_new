const db = require("../config/db");
const { MAIL_STATUS, ATTACHMENT_STATUS, MAIL_TYPE } = require("../constants/mailboxContract");
const rewardService = require("./userReward.service");
const logger = require("../utils/logger");

/**
 * Send a new mail to a user
 */
const sendMail = async ({ 
    userId, 
    subject, 
    body, 
    source = null, 
    sourceRef = null, 
    mailType = MAIL_TYPE.ANNOUNCEMENT, 
    attachments = [], // Array of { type, rewardId, itemId, currencyType, quantity, metadata }
    expiresInHours = null,
    dedupeKey = null 
}, connection = null) => {
    const conn = connection || await db.getConnection();
    const shouldRelease = !connection;

    try {
        if (!connection) await conn.beginTransaction();

        // 1. Idempotency Check
        if (dedupeKey) {
            const [existing] = await conn.execute(
                "SELECT id FROM mailbox_messages WHERE dedupe_key = ?",
                [dedupeKey]
            );
            if (existing.length > 0) {
                if (!connection) await conn.commit();
                return existing[0].id;
            }
        }

        const expiresAt = expiresInHours 
            ? new Date(Date.now() + expiresInHours * 3600000) 
            : null;
        
        const isClaimable = attachments.length > 0;

        // 2. Insert Mail Header
        const [mailResult] = await conn.execute(
            `INSERT INTO mailbox_messages 
            (user_id, subject, body, source, source_ref, mail_type, is_claimable, expires_at, dedupe_key) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, subject, body, source, sourceRef, mailType, isClaimable, expiresAt, dedupeKey]
        );

        const mailId = mailResult.insertId;

        // 3. Insert Attachments
        if (isClaimable) {
            const attachmentRows = attachments.map(att => [
                mailId,
                att.type || 'reward',
                att.rewardId || null,
                att.itemId || null,
                att.currencyType || null,
                att.quantity || 1,
                ATTACHMENT_STATUS.PENDING,
                JSON.stringify(att.metadata || {})
            ]);

            await conn.query(
                `INSERT INTO mailbox_attachments 
                (mail_id, attachment_type, reward_id, item_id, currency_type, quantity, status, metadata) 
                VALUES ?`,
                [attachmentRows]
            );
        }

        if (!connection) await conn.commit();
        return mailId;

    } catch (error) {
        if (!connection) await conn.rollback();
        if (error.code === 'ER_DUP_ENTRY') return null; // Race condition dedupe
        throw error;
    } finally {
        if (shouldRelease) conn.release();
    }
};

/**
 * Get mailbox list
 */
const getMailbox = async (userId, { status = null, limit = 20, offset = 0 } = {}) => {
    let query = `
        SELECT id, subject, status, mail_type, is_claimable, is_claimed, sent_at, expires_at, read_at
        FROM mailbox_messages 
        WHERE user_id = ? AND status != ?
    `;
    const params = [userId, MAIL_STATUS.DELETED];

    if (status) {
        query += " AND status = ?";
        params.push(status);
    }

    query += " ORDER BY sent_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);
    return rows;
};

/**
 * Read mail content and its attachments
 */
const readMail = async (userId, mailId) => {
    const [[mail]] = await db.execute(
        `SELECT * FROM mailbox_messages WHERE id = ? AND user_id = ?`,
        [mailId, userId]
    );

    if (!mail) throw new Error("Thư không tồn tại");

    if (mail.status === MAIL_STATUS.UNREAD) {
        await db.execute(
            `UPDATE mailbox_messages SET status = ?, read_at = NOW() WHERE id = ?`,
            [MAIL_STATUS.READ, mailId]
        );
        mail.status = MAIL_STATUS.READ;
        mail.read_at = new Date();
    }

    const [attachments] = await db.execute(
        `SELECT ma.*, r.reward_name, r.icon as reward_icon, r.reward_type
         FROM mailbox_attachments ma
         LEFT JOIN rewards r ON ma.reward_id = r.reward_id
         WHERE ma.mail_id = ?`,
        [mailId]
    );

    return { ...mail, attachments };
};

/**
 * Claim all attachments in a mail
 */
const claimMailAttachments = async (userId, mailId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Lock mail row
        const [[mail]] = await connection.query(
            `SELECT * FROM mailbox_messages WHERE id = ? AND user_id = ? FOR UPDATE`,
            [mailId, userId]
        );

        if (!mail) throw new Error("Thư không tồn tại");
        if (!mail.is_claimable) throw new Error("Thư không có quà để nhận");
        if (mail.is_claimed) throw new Error("Thư đã được nhận quà rồi");
        if (mail.expires_at && new Date(mail.expires_at) < new Date()) {
            throw new Error("Quà trong thư đã hết hạn");
        }

        // 2. Get pending attachments
        const [attachments] = await connection.query(
            `SELECT * FROM mailbox_attachments WHERE mail_id = ? AND status = ? FOR UPDATE`,
            [mailId, ATTACHMENT_STATUS.PENDING]
        );

        if (attachments.length === 0) {
             // Maybe already claimed or expired
             throw new Error("Không còn quà khả dụng trong thư này");
        }

        // 3. Process each attachment using existing reward logic where possible
        for (const att of attachments) {
            if (att.attachment_type === 'reward' && att.reward_id) {
                // We create a temporary user_reward record with status 'unlocked'
                // and then call claimRewardInstance to reuse the distribution logic.
                // This ensures consistency while transitioning.
                const userRewardId = await db.query(
                    `INSERT INTO user_rewards (user_id, reward_id, quantity, status, source, source_ref, earned_at)
                     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                    [userId, att.reward_id, att.quantity, 'unlocked', mail.source, mail.source_ref]
                ).then(res => res[0].insertId);

                await rewardService.claimRewardInstance({ userId, userRewardId }, connection);
            } 
            // Add other attachment types (currency, item) here if defined outside 'rewards'
            
            await connection.query(
                `UPDATE mailbox_attachments SET status = ?, claimed_at = NOW() WHERE id = ?`,
                [ATTACHMENT_STATUS.CLAIMED, att.id]
            );
        }

        // 4. Update mail status
        await connection.query(
            `UPDATE mailbox_messages SET is_claimed = TRUE, claimed_at = NOW() WHERE id = ?`,
            [mailId]
        );

        await connection.commit();
        return { success: true, message: "Nhận tất cả quà thành công!" };

    } catch (error) {
        await connection.rollback();
        logger.error("[Mailbox] claimMailAttachments failed", { userId, mailId, error: error.message });
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    sendMail,
    getMailbox,
    readMail,
    claimMailAttachments
};
