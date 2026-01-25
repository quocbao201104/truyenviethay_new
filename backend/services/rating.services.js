const Rating = require("../models/rating.model");

const RatingService = {
  addOrUpdateRating: async (userId, truyenId, rating) => {
    return await Rating.upsertRating(userId, truyenId, rating);
  },

  getRatingsForTruyen: async (truyenId) => {
    return await Rating.getRatingsByTruyenId(truyenId);
  },

  getTruyenRatingStats: async (truyenId) => {
    return await Rating.getAverageRating(truyenId);
  },

  getTopRatedStories: async (limit) => {
    return await Rating.getAllTopRatedStories(limit);
  },
};

module.exports = RatingService;
