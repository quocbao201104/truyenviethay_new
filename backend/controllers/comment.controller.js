const commentService = require("../services/comment.sevices");

exports.createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { truyen_id, content, parent_id } = req.body;
    await commentService.addComment(userId, truyen_id, content, parent_id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Thêm phần getComments để lấy comment của truyện
exports.getComments = async (req, res) => {
  try {
    const { truyen_id, page } = req.query;
    const comments = await commentService.getComments(truyen_id, page);
    res.json({
      success: true,
      comments,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa comment (chỉ admin)
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    await commentService.removeComment(id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
