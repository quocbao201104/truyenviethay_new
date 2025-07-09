const historyService = require("../services/history.sevices");

exports.getReadingHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const result = await historyService.getReadingHistory(userId, page);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server khi lấy lịch sử đọc." });
  }
};
