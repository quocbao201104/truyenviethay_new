const AuthorFollowModel = require("../models/authorFollow.model");

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const clampLimit = (val) => Math.min(MAX_LIMIT, Math.max(1, parseInt(val, 10) || DEFAULT_LIMIT));

exports.getMyFollowedAuthors = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = clampLimit(req.query.limit);
    const offset = (page - 1) * limit;

    const [authors, total] = await Promise.all([
      AuthorFollowModel.getFollowedAuthors(userId, offset, limit),
      AuthorFollowModel.getFollowedAuthorsCount(userId),
    ]);

    res.json({
      success: true,
      data: authors,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit) || 1,
        total,
        limit,
      },
    });
  } catch (err) {
    console.error("getMyFollowedAuthors error:", err);
    res.status(500).json({ message: "Lỗi server khi lấy tác giả theo dõi" });
  }
};
