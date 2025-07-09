const likeModel = require("../models/like.model");

exports.toggleLike = async (userId, truyenId) => {
  const liked = await likeModel.hasLiked(userId, truyenId);

  if (liked) {
    await likeModel.removeLike(userId, truyenId);
    return { liked: false };
  } else {
    await likeModel.addLike(userId, truyenId);
    return { liked: true };
  }
};

exports.getLikeStatus = async (userId, truyenId) => {
  const liked = await likeModel.hasLiked(userId, truyenId);
  const luot_thich = await likeModel.getLuotThich(truyenId);

  return {
    liked: !!(userId && liked),
    luot_thich: luot_thich || 0,
  };
};
