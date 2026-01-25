const UserLevelHistory = require("../models/userLevelHistory.model");
const UserLevel = require("../models/userLevels.model");
const UserPoints = require("../models/userPoint.model");

const getHistoryByUserId = async (userId) => {
  try {
    const history = await UserLevelHistory.getByUserId(userId);
    return history;
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
  // Lấy điểm hiện tại của user
  const userPointsData = await UserPoints.getPointsByUserId(user_id);
  if (!userPointsData) {
    throw new Error("Không tìm thấy thông tin điểm của người dùng");
  }

  const { total_points, current_level_id } = userPointsData;

  // Lấy thông tin level tiếp theo
  const next_level_id = current_level_id + 1;
  const nextLevel = await UserLevel.getById(next_level_id);

  if (!nextLevel) {
    throw new Error("Không còn cấp cao hơn để thăng cấp");
  }

  // Kiểm tra điều kiện điểm
  if (total_points < nextLevel.required_points) {
    throw new Error("Chưa đủ điểm để thăng cấp");
  }

  // Lấy cấp hiện tại từ lịch sử gần nhất để tính timeSpent
  const history = await UserLevelHistory.getByUserId(user_id);
  if (!history || history.length === 0) {
    throw new Error("Người dùng chưa có cấp bậc để thăng cấp");
  }

  const current = history[0];
  const start_date = new Date(current.start_date);
  const now = new Date();
  const timeSpent = Math.floor((now - start_date) / (1000 * 60 * 60 * 24)); // ngày

  const remainingLifespan = nextLevel.lifespan - timeSpent;
  const end_date = new Date(
    now.getTime() + remainingLifespan * 24 * 60 * 60 * 1000
  );

  // Tạo bản ghi lịch sử mới
  const newHistory = {
    user_id,
    level_id: next_level_id,
    start_date: now,
    end_date,
  };

  await UserLevelHistory.create(newHistory);
  await UserPoints.updateCurrentLevel(user_id, next_level_id);
};

module.exports = {
  getHistoryByUserId,
  createHistory,
  autoUpgrade,
};
