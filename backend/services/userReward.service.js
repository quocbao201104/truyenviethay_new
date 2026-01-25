const UserReward = require("../models/userReward.model");

const getUserRewards = async (userId) => {
  try {
    const rewards = await UserReward.getByUserId(userId);
    return rewards;
  } catch (error) {
    throw new Error("Lỗi khi lấy phần thưởng của người dùng: " + error.message);
  }
};

const claimReward = async ({ user_id, reward_id }) => {
  try {
    const rewardId = await UserReward.claim({ user_id, reward_id });
    return rewardId;
  } catch (error) {
    throw new Error("Lỗi khi nhận phần thưởng: " + error.message);
  }
};

module.exports = {
  getUserRewards,
  claimReward,
};
