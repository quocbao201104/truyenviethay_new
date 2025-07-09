const likeService = require("../services/like.sevices");

exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const truyenId = parseInt(req.params.id, 10);

    if (!truyenId)
      return res
        .status(400)
        .json({ success: false, message: "ID truyện không hợp lệ" });

    const result = await likeService.toggleLike(userId, truyenId);
    const luot_thich = await likeService.getLikeStatus(userId, truyenId);

    return res.json({
      success: true,
      liked: result.liked,
      luot_thich: luot_thich.luot_thich,
    });
  } catch (err) {
    console.error("Toggle like error:", err);
    return res.status(500).json({ success: false, message: "Có lỗi xảy ra!" });
  }
};

exports.getLikeStatus = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const truyenId = parseInt(req.params.id, 10);

    if (!truyenId)
      return res
        .status(400)
        .json({ success: false, message: "ID truyện không hợp lệ" });

    const result = await likeService.getLikeStatus(userId, truyenId);
    return res.json(result);
  } catch (err) {
    console.error("Get like status error:", err);
    return res.status(500).json({ success: false, message: "Có lỗi xảy ra!" });
  }
};
