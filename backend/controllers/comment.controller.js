const commentService = require("../services/comment.services");

exports.createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { truyen_id, content, parent_id } = req.body;
    const newComment = await commentService.addComment(userId, truyen_id, content, parent_id);

    // GAMIFICATION TRIGGER: Comment
    try {
        const taskService = require("../services/task.service");
        const eventOpts = {
             eventType: "comment_story",
             eventRef: `story:${truyen_id}:comment:${commentId}`,
        };
        taskService.completeTaskByName(userId, "Bình luận truyện", eventOpts).catch(err => {
             console.error("Gamification Comment Error:", err.message);
        });
    } catch (e) {
        console.error("Gamification Setup Error:", e.message);
    }

    res.json({ success: true, data: newComment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { truyen_id, page } = req.query;
    const result = await commentService.getComments(truyen_id, page);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      total: result.total,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa comment — admin/author/chủ comment (15p hoặc chưa có reply)
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role ?? "user";
    const deleteReason = req.body?.reason ?? null;
    await commentService.removeComment(id, userId, userRole, deleteReason);
    res.json({ success: true });
  } catch (err) {
    const status = err.status ?? (err.message.includes("quyền") || err.message.includes("15 phút") || err.message.includes("phản hồi") ? 403 : 400);
    res.status(status).json({ error: err.message });
  }
};
