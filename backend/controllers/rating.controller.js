const RatingService = require("../services/rating.services");

const RatingController = {
  createOrUpdateRating: async (req, res) => {
    try {
      const userId = req.user.id;
      const { truyenId, rating } = req.body;
      await RatingService.addOrUpdateRating(userId, truyenId, rating);
      res.status(200).json({ success: true, message: "Đánh giá thành công!" });
    } catch (error) {
      const status = error.status ?? (error.code === "ER_NO_REFERENCED_ROW_2" ? 404 : 400);
      res.status(status).json({ error: error.message || "Lỗi khi đánh giá" });
    }
  },

  getRatings: async (req, res) => {
    try {
      const { truyenId } = req.params;
      const ratings = await RatingService.getRatingsForTruyen(truyenId);
      const stats = await RatingService.getTruyenRatingStats(truyenId);
      res.status(200).json({ success: true, stats, ratings });
    } catch (error) {
      res.status(error.status ?? 400).json({ error: error.message || "Lỗi khi lấy đánh giá" });
    }
  },

  getTopRated: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const stories = await RatingService.getTopRatedStories(limit);
      res.status(200).json({ success: true, data: stories });
    } catch (error) {
      res.status(error.status ?? 400).json({ error: error.message || "Lỗi khi lấy xếp hạng" });
    }
  },
};

module.exports = RatingController;
