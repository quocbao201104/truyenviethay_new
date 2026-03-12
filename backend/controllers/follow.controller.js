// controllers/follow.controller.js

const followService = require("../services/follow.services");

// Lấy danh sách truyện theo dõi — format chuẩn { data, pagination, total }
exports.getFollowList = async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;

  try {
    const result = await followService.getFollowedStories(userId, page, limit);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      total: result.pagination?.total ?? result.data?.length ?? 0,
    });
  } catch (error) {
    console.error("getFollowList error:", error);
    res.status(error.status ?? 400).json({ error: error.message || "Lỗi khi lấy danh sách truyện theo dõi" });
  }
};

// Toggle theo dõi (thêm hoặc bỏ theo dõi)
exports.toggleFollow = async (req, res) => {
  try {
    const userId = req.user.id;
    const truyenId = parseInt(req.params.truyenId, 10);
    const result = await followService.toggleFollow(userId, truyenId);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Toggle follow error:", err);
    const status = err.status ?? (err.code === "ER_NO_REFERENCED_ROW_2" ? 404 : 400);
    res.status(status).json({ error: err.message || "Có lỗi xảy ra!" });
  }
};
