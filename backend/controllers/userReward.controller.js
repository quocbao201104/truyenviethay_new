const userRewardService = require("../services/userReward.service");

const getUserRewards = async (req, res) => {
  try {
    const { userId } = req.params;
    const rewards = await userRewardService.getUserRewards(userId);
    res.json(rewards);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy phần thưởng đã nhận" });
  }
};

const claimReward = async (req, res) => {
  try {
    const { user_id, reward_id } = req.body;
    await userRewardService.claimReward(user_id, reward_id);
    res.status(201).json({ message: "Nhận phần thưởng thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi nhận phần thưởng" });
  }
};

module.exports = {
  getUserRewards,
  claimReward,
};
