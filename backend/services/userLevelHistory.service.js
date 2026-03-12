const UserLevelHistory = require("../models/userLevelHistory.model");
const UserLevel = require("../models/userLevels.model");
const UserPoints = require("../models/userPoint.model");
const { triggerLevelUpRewards } = require("./userReward.service");

const getHistoryByUserId = async (userId, pagination = {}) => {
  try {
    const { limit = 10, offset = 0 } = pagination;
    const history = await UserLevelHistory.getByUserId(userId, limit, offset);
    const total = await UserLevelHistory.getCountByUserId(userId);

    // Filter next level info based on role compatibility
    const db = require("../config/db");
    const [users] = await db.execute("SELECT role FROM users_new WHERE id = ?", [userId]);
    const userRole = users[0]?.role || 'user';

    const processedData = history.map(item => {
        // If next level is 'author' but user is just 'user', hide next level info to show "Max Level" UI
        if (item.next_level_id && item.next_level_type === 'author' && userRole === 'user') {
            return {
                ...item,
                next_level_id: null,
                next_level_name: null,
                next_level_points: null,
                next_level_type: null
            };
        }
        return item;
    });

    return { data: processedData, total };
  } catch (error) {
    throw new Error("Lỗi khi lấy lịch sử cấp bậc: " + error.message);
  }
};

const createHistory = async (data) => {
  try {
    // Lấy thông tin cấp bậc cũ và mới
    const oldLevel = await UserLevel.getById(data.old_level_id); 
    const newLevel = await UserLevel.getById(data.level_id); 

    if (!oldLevel || !newLevel) {
      throw new Error("Không tìm thấy cấp bậc với ID");
    }

    // Tính toán số ngày đã tiêu hao từ cấp bậc cũ
    const timeSpent = data.timeSpent || 0; 

    // Tính toán số ngày còn lại trong cấp bậc mới
    const remainingLifespan = newLevel.lifespan - timeSpent;

    // Tính toán end_date của cấp bậc mới
    const start_date = new Date();
    const end_date = new Date(start_date);
    end_date.setDate(start_date.getDate() + remainingLifespan);

    // Lưu lịch sử cấp bậc vào DB
    const historyData = {
      user_id: data.user_id,
      level_id: data.level_id,
      start_date: start_date,
      end_date: end_date,
    };

    const insertId = await UserLevelHistory.create(historyData);
    return insertId;
  } catch (error) {
    throw new Error("Lỗi khi tạo lịch sử cấp bậc: " + error.message);
  }
};

const autoUpgrade = async (user_id) => {
  const db = require("../config/db");
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Get current points with pessimistic lock
    const [userPoints] = await connection.execute(
      "SELECT total_exp FROM user_points WHERE user_id = ? FOR UPDATE",
      [user_id]
    );

    if (userPoints.length === 0) {
      throw new Error("Không tìm thấy thông tin điểm của người dùng");
    }

    const { total_exp } = userPoints[0];

    // H3: Get current level from user_levels_history (source of truth)
    const [history] = await connection.execute(
      "SELECT level_id, start_date FROM user_levels_history WHERE user_id = ? ORDER BY start_date DESC LIMIT 1",
      [user_id]
    );

    if (history.length === 0) {
      throw new Error("Người dùng chưa có cấp bậc để thăng cấp");
    }

    const current = history[0];
    const current_level_id = current.level_id;

    // Fetch definition of current level to find next path
    const [currentLevelDefs] = await connection.execute(
        "SELECT * FROM user_levels WHERE level_id = ?",
        [current_level_id]
    );

    if (currentLevelDefs.length === 0) {
        throw new Error("Dữ liệu cấp độ hiện tại không tồn tại");
    }
    const currentLevelDef = currentLevelDefs[0];

    // Check if max level reached
    if (!currentLevelDef.next_level_id) {
        throw new Error("Bạn đã đạt cấp độ tối đa, không thể thăng cấp thêm.");
    }

    const next_level_id = currentLevelDef.next_level_id;

    // Check next level exists and get requirements
    const [nextLevels] = await connection.execute(
      "SELECT * FROM user_levels WHERE level_id = ?",
      [next_level_id]
    );

    if (nextLevels.length === 0) {
      throw new Error("Dữ liệu cấp độ tiếp theo không tồn tại");
    }

    const nextLevel = nextLevels[0];

    // Check points requirement
    if (total_exp < nextLevel.required_points) {
      throw new Error(`Chưa đủ điểm. Cần ${nextLevel.required_points} điểm để thăng cấp.`);
    }

    // --- CONSTRAINTS CHECK ---
    // Rule: User role must match the target level type
    const [users] = await connection.execute("SELECT role FROM users_new WHERE id = ?", [user_id]);
    const userRole = users[0]?.role;

    if (nextLevel.type === 'author' && userRole === 'user') {
        // AUTOMATIC ROLE UPGRADE: If user hits an author level, promote them to author
        await connection.execute("UPDATE users_new SET role = 'author' WHERE id = ?", [user_id]);
        console.log(`User ${user_id} automatically promoted to 'author' role for level ${nextLevel.name}`);
    } else if (nextLevel.type === 'author' && userRole !== 'author' && userRole !== 'admin') {
        throw new Error(`Cảnh giới này chỉ dành cho Tác giả hoặc Quản trị viên.`);
    }

    // --- LIFESPAN CALCULATION (CUMULATIVE) ---
    // User requirement: New Expiry = Root Start Date + New Level Lifespan
    // 1. Find the root start date (Day 0 of Level 1)
    const [rootHistory] = await connection.execute(
        "SELECT start_date FROM user_levels_history WHERE user_id = ? ORDER BY start_date ASC LIMIT 1",
        [user_id]
    );
    
    // Fallback: If no history (shouldn't happen if upgrading), use current.start_date or NOW
    let rootStartDate = new Date();
    if (rootHistory.length > 0) {
        rootStartDate = new Date(rootHistory[0].start_date);
    }

    // Calculate total lifespan (T_max) by summing lifespans of all predecessor levels
    let totalLifespanDays = 0;
    try {
        // We sum lifespans of all levels that lead to this next_level_id by required_points
        // This is a simplified linear model.
        const [lifespanRows] = await connection.execute(
            "SELECT SUM(COALESCE(lifespan, 0)) as total_lifespan FROM user_levels WHERE required_points <= ?",
            [nextLevel.required_points]
        );
        if (lifespanRows.length > 0 && lifespanRows[0].total_lifespan !== null) {
            totalLifespanDays = parseInt(lifespanRows[0].total_lifespan);
        }
    } catch (e) {
        console.warn("Failed to sum lifespans, falling back to next level's lifespan sum", e);
        totalLifespanDays = (nextLevel.lifespan || 365);
    }
    
    // Safety check for T_max
    if (totalLifespanDays <= 0) totalLifespanDays = 365;

    // Calculate new end date based on Root Date
    const end_date_history = new Date(rootStartDate.getTime() + totalLifespanDays * 24 * 60 * 60 * 1000);
    
    // Current time for history start
    const now = new Date();

    // Insert new history record
    await connection.execute(
      "INSERT INTO user_levels_history (user_id, level_id, start_date, end_date) VALUES (?, ?, ?, ?)",
      [user_id, next_level_id, now, end_date_history]
    );

    // Update expiry_date and current_level_id in user_points (account status)
    await connection.execute(
        "UPDATE user_points SET expiry_date = ?, current_level_id = ? WHERE user_id = ?",
        [end_date_history, next_level_id, user_id]
    );

    await connection.commit();
    connection.release(); // Giải phóng connection sau khi commit

    try {
      const ChatProfileService = require("./chatProfile.service");
      ChatProfileService.invalidateProfile(user_id).catch(() => {});
    } catch (e) {}

    // --- Gửi quà vào Hộp Thư (Inbox) ---
    // Thực hiện SAU khi commit để không block transaction lên cấp
    // Quà sẽ có status='pending', user cần vào hộp thư để nhận thủ công
    let grantedRewards = [];
    try {
        grantedRewards = await triggerLevelUpRewards(user_id, next_level_id);
        if (grantedRewards.length > 0) {
            console.log(`[LevelUp] Đã gửi ${grantedRewards.length} quà vào hộp thư của user ${user_id} (Cấp ${next_level_id})`);
        }
    } catch (rewardErr) {
        // Không để lỗi quest/reward phá vỡ trải nghiệm lên cấp
        console.error(`[LevelUp] Lỗi khi gửi quà cho user ${user_id}:`, rewardErr.message);
    }

    return {
        user_id: user_id,
        new_level_id: next_level_id,
        expiry_date: end_date_history,
        rewards_sent: grantedRewards.length,
        message: `Chúc mừng! Bạn đã thăng lên cấp ${next_level_id} (${nextLevel.name})! Bạn có ${grantedRewards.length} phần thưởng mới trong Hộp Thư.`,
    };
  } catch (error) {
    await connection.rollback();
    connection.release();
    require("../utils/logger").warn("[Level] autoUpgrade rollback", { user_id, error: error.message });
    throw error;
  }
};

/**
 * Idempotent bootstrap: ensure user has a level. Concurrency-safe via row lock.
 */
const ensureUserLevel = async (userId) => {
    const db = require("../config/db");
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Lock user row to serialize concurrent bootstrap (prevents duplicate starter records)
        const [users] = await connection.execute(
            "SELECT id, role FROM users_new WHERE id = ? FOR UPDATE",
            [userId]
        );
        if (users.length === 0) {
            await connection.rollback();
            return 1;
        }

        // Double-check: another request may have just created history
        const [existing] = await connection.execute(
            "SELECT level_id FROM user_levels_history WHERE user_id = ? ORDER BY start_date DESC LIMIT 1",
            [userId]
        );
        if (existing.length > 0) {
            await connection.commit();
            const currentLevelId = existing[0].level_id;
            try {
                await triggerLevelUpRewards(userId, currentLevelId);
            } catch (e) {
                console.error(`[EnsureRewards] Failed for existing user ${userId}:`, e.message);
            }
            return currentLevelId;
        }

        const userRole = users[0].role;
        const [levels] = await connection.execute(
            "SELECT level_id, type, lifespan, required_points FROM user_levels WHERE type = ? ORDER BY required_points ASC, level_id ASC LIMIT 1",
            [userRole]
        );

        let defaultLevelId = 1;
        let lifespan = 365;

        if (levels.length > 0) {
            defaultLevelId = levels[0].level_id;
            lifespan = levels[0].lifespan || 365;
            try {
                const [lifespanRows] = await connection.execute(
                    "SELECT SUM(COALESCE(lifespan, 0)) as total_lifespan FROM user_levels WHERE required_points <= ?",
                    [levels[0].required_points]
                );
                if (lifespanRows.length > 0 && lifespanRows[0].total_lifespan != null) {
                    lifespan = parseInt(lifespanRows[0].total_lifespan);
                }
            } catch (e) {}
            if (lifespan <= 0) lifespan = 365;
        } else {
            console.warn(`No levels defined for role ${userRole}, defaulting to level 1`);
        }

        const now = new Date();
        const end_date = new Date(now.getTime() + lifespan * 24 * 60 * 60 * 1000);

        await connection.execute(
            "INSERT INTO user_levels_history (user_id, level_id, start_date, end_date) VALUES (?, ?, ?, ?)",
            [userId, defaultLevelId, now, end_date]
        );

        await connection.commit();

        try {
            await triggerLevelUpRewards(userId, defaultLevelId);
        } catch (e) {
            console.error(`[InitialLevel] Failed to trigger rewards for user ${userId}:`, e.message);
        }
        try {
            const ChatProfileService = require("./chatProfile.service");
            ChatProfileService.invalidateProfile(userId).catch(() => {});
        } catch (e) {}
        return defaultLevelId;
    } catch (error) {
        await connection.rollback();
        require("../utils/logger").warn("[Level] ensureUserLevel rollback", { userId, error: error.message });
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
  getHistoryByUserId,
  createHistory,
  autoUpgrade,
  ensureUserLevel
};
