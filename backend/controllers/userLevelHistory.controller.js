const levelHistoryService = require("../services/userLevelHistory.service");

const getHistoryByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await levelHistoryService.getHistoryByUserId(userId);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy lịch sử cấp bậc" });
  }
};

const addHistory = async (req, res) => {
  try {
    const { user_id, level_id, old_level_id, timeSpent } = req.body;

    await levelHistoryService.createHistory({
      user_id,
      level_id,
      old_level_id,
      timeSpent,
    });

    res.status(201).json({ message: "Thêm lịch sử cấp bậc thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi thêm lịch sử cấp bậc" });
  }
};

const upgradeLevel = async (req, res) => {
  try {
    const user_id = req.user.id;

    await levelHistoryService.autoUpgrade(user_id);

    res.status(201).json({ message: "Thăng cấp thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi thăng cấp", error: err.message });
  }
};

const getCurrentLevelOfUser = async (userId) => {
  const [rows] = await db.execute(
    `
    SELECT level_id 
    FROM user_levels_history 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 1
  `,
    [userId]
  );

  return rows[0]?.level_id || null;
};

module.exports = {
  getHistoryByUserId,
  addHistory,
  upgradeLevel,
  getCurrentLevelOfUser,
};
