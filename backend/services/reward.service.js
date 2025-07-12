const Reward = require("../models/reward.model");

const getAllRewards = async () => {
  try {
    const rewards = await Reward.getAll();
    return rewards;
  } catch (error) {
    throw new Error("Lỗi khi lấy danh sách phần thưởng: " + error.message);
  }
};

const createReward = async ({ name, required_points, reward_type }) => {
  try {
    const rewardId = await Reward.create({
      name,
      required_points,
      reward_type,
    });
    return rewardId;
  } catch (error) {
    throw new Error("Lỗi khi tạo phần thưởng: " + error.message);
  }
};

module.exports = {
  getAllRewards,
  createReward,
};
