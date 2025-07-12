const pointService = require("../services/userPoint.service");

const getUserPoints = async (req, res) => {
  try {
    const userId = req.params.userId; // Lấy userId từ URL params
    const points = await pointService.getPointsByUserId(userId); // Dùng pointService thay vì userPointsService
    if (!points) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.status(200).json(points); // Trả về thông tin điểm người dùng
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy điểm người dùng" });
  }
};

const updatePoints = async (req, res) => {
  try {
    const { user_id, points } = req.body;
    const result = await pointService.createOrUpdatePoints({
      user_id,
      points,
    });
    res.status(200).json({
      message: "Cập nhật điểm thành công",
      affectedRows: result.affectedRows,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật điểm" });
  }
};

module.exports = {
  getUserPoints,
  updatePoints,
};
