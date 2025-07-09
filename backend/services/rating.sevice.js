const Rating = require("../models/rating.model");

const RatingService = {
  addOrUpdateRating: async (userId, truyenId, rating, comment) => {
    return await Rating.upsertRating(userId, truyenId, rating, comment);
  },

  getRatingsForTruyen: async (truyenId) => {
    return await Rating.getRatingsByTruyenId(truyenId);
  },

  getTruyenRatingStats: async (truyenId) => {
    return await Rating.getAverageRating(truyenId);
  },
};

module.exports = RatingService;
