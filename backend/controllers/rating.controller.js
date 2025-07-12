const RatingService = require("../services/rating.sevice");

const RatingController = {
  createOrUpdateRating: async (req, res) => {
    try {
      const userId = req.user.id; // middleware auth rồi
      const { truyenId, rating, comment } = req.body;

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating phải từ 1 đến 5 sao." });
      }

      await RatingService.addOrUpdateRating(userId, truyenId, rating, comment);
      res.status(200).json({ message: "Đánh giá thành công!" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Lỗi khi đánh giá", error: error.message });
    }
  },

  getRatings: async (req, res) => {
    try {
      const { truyenId } = req.params;
      const ratings = await RatingService.getRatingsForTruyen(truyenId);
      const stats = await RatingService.getTruyenRatingStats(truyenId);
      res.status(200).json({ stats, ratings });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Lỗi khi lấy đánh giá", error: error.message });
    }
  },
};

module.exports = RatingController;
