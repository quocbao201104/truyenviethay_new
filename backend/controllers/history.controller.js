const historyService = require("../services/history.services");

exports.getReadingHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = req.query.page;
    const limit = req.query.limit;
    const result = await historyService.getReadingHistory(userId, page, limit);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server khi lấy lịch sử đọc." });
  }
};

exports.saveReadingHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { truyenId, chuongId } = req.body;

    if (!truyenId || !chuongId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu truyenId hoặc chuongId"
      });
    }

    await historyService.saveReadingHistory(userId, truyenId, chuongId);

    res.json({
      success: true,
      message: "Đã lưu lịch sử đọc"
    });
  } catch (error) {
    console.error("saveReadingHistory error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lưu lịch sử đọc."
    });
  }
};
