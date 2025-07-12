const rewardService = require("../services/reward.service");

const getAllRewards = async (req, res) => {
  try {
    const rewards = await rewardService.getAllRewards();
    res.json(rewards);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách phần thưởng" });
  }
};

const createReward = async (req, res) => {
  try {
    const { name, description, required_points } = req.body;
    await rewardService.createReward(name, description, required_points);
    res.status(201).json({ message: "Tạo phần thưởng thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi tạo phần thưởng" });
  }
};

module.exports = {
  getAllRewards,
  createReward,
};
