const db = require("../config/db");
const UserCurrency = require("../models/userCurrency.model");
const UserLevelHistory = require("./userLevelHistory.service");
const { REWARD_STATUS, REWARD_SOURCE } = require("../constants/rewardContract");
const { INVENTORY_SOURCE } = require("../constants/inventoryContract");
const mailboxService = require("./mailbox.services");
const { MAIL_TYPE } = require("../constants/mailboxContract");
const logger = require("../utils/logger");

/**
 * Gửi quà vào hộp thư khi user lên cấp (gọi từ userLevelHistory.service)
 */
const triggerLevelUpRewards = async (userId, newLevel) => {
    const [levelRewards] = await db.query(
        `SELECT lr.reward_id, lr.quantity, r.reward_type, r.metadata
         FROM level_rewards lr
         JOIN rewards r ON lr.reward_id = r.reward_id
         WHERE lr.level_id = ?`,
        [newLevel]
    );
    if (!levelRewards || levelRewards.length === 0) return [];

    const results = [];
    for (const r of levelRewards) {
        // Idempotency: Each level reward for a user has a unique dedupe_key
        const dedupeKey = `level_up:${userId}:${newLevel}:${r.reward_id}`;
        const userRewardId = await grantReward({
            userId,
            rewardId: r.reward_id,
            source: REWARD_SOURCE.LEVEL,
            sourceRef: newLevel,
            dedupeKey: dedupeKey,
            metadata: { level: newLevel }
        });
        
        if (userRewardId) {
            results.push({ reward_id: r.reward_id, reward_type: r.reward_type, quantity: r.quantity || 1 });
        }
    }
    
    return results;
};

/**
 * Grant a reward (Internal/Admin/System Trigger)
 */
const grantReward = async ({ userId, rewardId, source, sourceRef = null, dedupeKey = null, templateCode = null, metadata = {} }, connection = null) => {
    const conn = connection || await db.getConnection();
    const shouldRelease = !connection;

    try {
        if (!connection) await conn.beginTransaction();

        // 1. Check Dedupe Key before everything (Fast exit)
        if (dedupeKey) {
            const [existing] = await conn.execute(
                "SELECT id FROM user_rewards WHERE dedupe_key = ?",
                [dedupeKey]
            );
            if (existing.length > 0) {
                console.log(`[GrantReward] Duplicate grant blocked by dedupe_key: ${dedupeKey}`);
                if (!connection) await conn.commit();
                return null;
            }
        }

        const [rewards] = await conn.execute("SELECT * FROM rewards WHERE reward_id = ?", [rewardId]);
        if (rewards.length === 0) throw new Error(`Reward ID ${rewardId} does not exist`);
        
        const reward = rewards[0];

        if (!reward.is_active) {
            console.log(`[Reward] Skipped disabled reward ${rewardId}`);
            if (!connection) await conn.commit();
            return null;
        }

        if (!reward.is_repeatable) {
            const [existing] = await conn.execute(
                "SELECT id FROM user_rewards WHERE user_id = ? AND reward_id = ? AND status != ?",
                [userId, rewardId, REWARD_STATUS.EXPIRED]
            );
            if (existing.length > 0) {
                console.log(`[GrantReward] User ${userId} already has non-repeatable reward ${rewardId}`);
                if (!connection) await conn.commit();
                return null; 
            }
        }

        let expiredAt = null;
        if (reward.duration_hours) {
            expiredAt = new Date(Date.now() + reward.duration_hours * 3600000);
        }

        const initialStatus = REWARD_STATUS.UNLOCKED; 

        // INSERT logic: use IGNORE if dedupeKey exists to prevent race condition errors, 
        // but we already checked above for better logging.
        const [result] = await conn.execute(
            `INSERT INTO user_rewards 
            (user_id, reward_id, quantity, status, source, source_ref, dedupe_key, template_code, earned_at, metadata, expired_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
            [
                userId, 
                rewardId, 
                reward.quantity || 1, 
                initialStatus, 
                source, 
                sourceRef, 
                dedupeKey, 
                templateCode, 
                JSON.stringify(metadata), 
                expiredAt
            ]
        );

        const userRewardId = result.insertId;

        // --- DUAL RUN: Sync to New Mailbox System ---
        try {
            const dedupeKeyMail = dedupeKey ? `mail_sync:${dedupeKey}` : `mail_sync_ur:${userRewardId}`;
            await mailboxService.sendMail({
                userId,
                subject: `Quà tặng: ${reward.reward_name || 'Phần thưởng mới'}`,
                body: `Bạn vừa nhận được 1 phần quà: ${reward.reward_name || 'Vật phẩm'} x ${reward.quantity || 1}`,
                source,
                sourceRef,
                mailType: MAIL_TYPE.REWARD,
                attachments: [
                    { type: 'reward', rewardId: rewardId, quantity: reward.quantity || 1 }
                ],
                expiresInHours: reward.duration_hours,
                dedupeKey: dedupeKeyMail
            }, conn);
        } catch (dualErr) {
            // We don't want to fail the main transaction if mailbox sync fails, 
            // unless we want strict consistency. For now, just log.
            logger.error("[Reward] Dual-run mailbox sync failed", { userRewardId, error: dualErr.message });
        }
        // --------------------------------------------

        if (!connection) await conn.commit();
        return userRewardId;

    } catch (error) {
        if (!connection) {
            await conn.rollback();
            logger.warn("[Reward] grantReward rollback", { userId, rewardId, dedupeKey, error: error.message });
        }
        // Handle unique constraint violation gracefully if race condition occurs
        if (error.code === 'ER_DUP_ENTRY' && error.message.includes('idx_user_rewards_dedupe_key')) {
            console.log(`[GrantReward] Race condition caught: duplicate dedupe_key ${dedupeKey}`);
            return null;
        }
        throw error;
    } finally {
        if (shouldRelease) conn.release();
    }
};

/**
 * Buy a reward from Shop (User Action)
 */
const buyReward = async ({ userId, rewardId }) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get Reward & Price
        const [rewards] = await connection.execute("SELECT * FROM rewards WHERE reward_id = ?", [rewardId]);
        if (rewards.length === 0) throw new Error("Vật phẩm không tồn tại");
        const reward = rewards[0];

        // 2. Check Logic
        if (!reward.price || reward.price <= 0) {
             throw new Error("Vật phẩm này không bán/miễn phí, hãy nhận qua sự kiện hoặc cấp độ.");
        }
        
        // 3. Deduct Currency (Model throws if insufficient)
        await UserCurrency.deduct(userId, reward.price, connection);

        // 4. Grant Reward
        // Pass connection to share transaction
        const userRewardId = await grantReward({ 
            userId, 
            rewardId, 
            source: REWARD_SOURCE.SHOP,
            metadata: { bought_price: reward.price } 
        }, connection);

        if (!userRewardId) {
             // grantReward returns null if already owned unique item
             throw new Error("Bạn đã sở hữu vật phẩm giới hạn này rồi.");
        }

        await connection.commit();
        return { success: true, message: "Mua thành công!", userRewardId };

    } catch (error) {
        await connection.rollback();
        logger.warn("[Reward] buyReward rollback", { userId, rewardId, error: error.message });
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Claim a Milestone/Free Reward (User Action)
 */
const claimMilestone = async ({ userId, rewardId }) => {
    // Note: This matches the "Catalog Claim" flow where user says "I want reward #5"
    // and we check if they qualify (Level).
    // This is distinct from "Claiming an Unlocked Instance" (:userRewardId/claim).
    // Let's call this `qualifyAndGrant` or `claimCatalogReward`?
    // User request: "points_required (min_level) mục đích là nếu đạt mốc thì nhận free"
    
    // NEW LOGIC: This creates a NEW user_reward instance if qualified.
    
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const [rewards] = await connection.execute("SELECT * FROM rewards WHERE reward_id = ?", [rewardId]);
        if (rewards.length === 0) throw new Error("Phần thưởng không tồn tại");
        const reward = rewards[0];

        // 1. Check Level Requirement
        if (reward.min_level > 0) {
             // Get current user level
             // Reuse ensureUserLevel logic or just read history?
             // userLevelHistory.service.ensureUserLevel returns current Level ID.
             const currentLevelId = await UserLevelHistory.ensureUserLevel(userId);
             
             // We need Level Number (or rank?), but level_id usually maps 1:1 or we need level definition.
             // Let's look up the level_id to get its order/magnitude?
             // Assuming level_id IS the level number for simplicity or we fetch `level_value`?
             // Usually level_id increments.
             
             // Actually, `user_levels` might have `level_value` or `required_points`.
             // If `min_level` refers to `level_id`, we compare IDs.
             if (currentLevelId < reward.min_level) {
                 throw new Error(`Bạn cần đạt cấp độ ${reward.min_level} để nhận thưởng.`);
             }
        } else {
             // If min_level is 0/null and price is 0... maybe it's free for everyone?
        }

        // 2. Grant
        const userRewardId = await grantReward({ 
            userId, 
            rewardId, 
            source: REWARD_SOURCE.LEVEL,
            metadata: { claimed_at_level: reward.min_level }
        }, connection);

         if (!userRewardId) throw new Error("Bạn đã nhận thưởng này rồi.");

        await connection.commit();
        return { success: true, userRewardId };

    } catch (error) {
        await connection.rollback();
        logger.warn("[Reward] claimMilestone rollback", { userId, rewardId, error: error.message });
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Claim/Activate an unlocked reward instance (single entry point)
 * Route: POST /claim (body: userRewardId) và POST /:userRewardId/claim
 */
const claimRewardInstance = async ({ userId, userRewardId }) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [[userReward]] = await connection.query(
            `SELECT ur.*, r.reward_type, r.metadata as reward_config, r.duration_hours
             FROM user_rewards ur
             JOIN rewards r ON ur.reward_id = r.reward_id
             WHERE ur.id = ? AND ur.user_id = ? FOR UPDATE`,
            [userRewardId, userId]
        );

        if (!userReward) {
            throw new Error("Quà không tồn tại hoặc đã được nhận rồi.");
        }
        if (userReward.status !== REWARD_STATUS.UNLOCKED) {
            throw new Error(`Quà ở trạng thái ${userReward.status}, không thể nhận.`);
        }
        if (userReward.expired_at && new Date(userReward.expired_at) < new Date()) {
            throw new Error("Quà đã hết hạn.");
        }

        const meta = typeof userReward.reward_config === 'string'
            ? JSON.parse(userReward.reward_config || '{}')
            : (userReward.reward_config || {});
        const { reward_type, reward_id, quantity = 1, duration_hours } = userReward;

        // Phân phát theo loại
        if (reward_type === 'currency') {
            const currencyType = meta.currency_type || 'linh_thach';
            const amount = (meta.amount || meta.currency || 0) * quantity;
            if (currencyType === 'linh_thach') {
                await connection.query(
                    `UPDATE users_new SET linh_thach = linh_thach + ? WHERE id = ?`,
                    [amount, userId]
                );
            } else {
                throw new Error(`currency_type không hỗ trợ: ${currencyType}`);
            }
        } else if (reward_type === 'exp') {
            const amount = (meta.amount || meta.exp || 0) * quantity;
            await connection.query(
                `INSERT INTO user_points (user_id, total_exp) VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE total_exp = total_exp + VALUES(total_exp)`,
                [userId, amount]
            );
        } else if (['badge', 'item', 'buff', 'title'].includes(reward_type)) {
            let expiresAt = null;
            if (duration_hours && duration_hours > 0) {
                const d = new Date();
                d.setHours(d.getHours() + duration_hours);
                expiresAt = d.toISOString().slice(0, 19).replace('T', ' ');
            }
            await connection.query(
                `INSERT INTO user_inventory (user_id, reward_id, quantity, expires_at, acquired_from)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity),
                   expires_at = IF(VALUES(expires_at) IS NOT NULL, VALUES(expires_at), expires_at)`,
                [userId, reward_id, quantity, expiresAt, INVENTORY_SOURCE.REWARD]
            );
        }

        await connection.query(
            `UPDATE user_rewards SET status = ?, claimed_at = NOW() WHERE id = ?`,
            [REWARD_STATUS.CLAIMED, userRewardId]
        );

        await connection.commit();
        return {
            success: true,
            message: "Nhận quà thành công!",
            reward: { reward_type, quantity, metadata: meta },
        };
    } catch (error) {
        await connection.rollback();
        logger.warn("[Reward] claimRewardInstance rollback", { userId, userRewardId, error: error.message });
        throw error;
    } finally {
        connection.release();
    }
};

const useReward = async ({ userId, userRewardId }) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [[row]] = await connection.execute(
            "SELECT id FROM user_rewards WHERE id = ? AND user_id = ? FOR UPDATE",
            [userRewardId, userId]
        );
        if (!row) throw new Error("Vật phẩm không tồn tại hoặc không thuộc về bạn.");
        await connection.execute(
            "UPDATE user_rewards SET status = ?, used_at = NOW() WHERE id = ? AND user_id = ?",
            [REWARD_STATUS.USED, userRewardId, userId]
        );
        await connection.commit();
        return { success: true };
    } catch (error) {
        await connection.rollback();
        logger.warn("[Reward] useReward rollback", { userId, userRewardId, error: error.message });
        throw error;
    } finally {
        connection.release();
    }
};

const getUserRewards = async (userId, filters = {}) => {
    // Same as before
    const { status, limit = 50, offset = 0 } = filters;
    const db = require("../config/db");
    let query = `
        SELECT ur.*, r.reward_name, r.description, r.icon, r.reward_type, r.rarity 
        FROM user_rewards ur
        JOIN rewards r ON ur.reward_id = r.reward_id
        WHERE ur.user_id = ?
    `;
    const params = [userId];
    if (status) { query += " AND ur.status = ?"; params.push(status); }
    query += " ORDER BY ur.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await db.query(query, params);
    return rows;
};

module.exports = {
    getUserRewards,
    grantReward,
    buyReward,
    claimMilestone,
    claimRewardInstance,
    useReward,
    triggerLevelUpRewards,
};
