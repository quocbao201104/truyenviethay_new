const Rating = require("../models/rating.model");
const { invalidate } = require("../utils/cache");

const RatingService = {
  addOrUpdateRating: async (userId, truyenId, rating) => {
    const result = await Rating.upsertRating(userId, truyenId, rating);
    await invalidate("topRated");
    return result;
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
