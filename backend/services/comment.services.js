const commentModel = require("../models/comment.model");
const LIMIT = 10; 

exports.addComment = async (userId, truyenId, content, parentId) => {
  if (!content.trim()) throw new Error("Nội dung bình luận trống.");
  await commentModel.createComment(truyenId, userId, content, parentId);
};

exports.getComments = async (truyenId, page = 1) => {
  const offset = (page - 1) * LIMIT;
  const comments = await commentModel.getCommentsByTruyen(
    truyenId,
    LIMIT,
    offset
  );

  // Phần reply, nếu muốn tối ưu có thể lấy ngay trong comment query
  for (const comment of comments) {
    const replies = await commentModel.getReplies(comment.id);
    comment.replies = replies.map((reply) => ({
      ...reply,
      content: reply.is_deleted ? "[Bình luận đã bị xóa]" : reply.content,
    }));
    comment.content = comment.is_deleted
      ? "[Bình luận đã bị xóa]"
      : comment.content;
  }

  return comments;
};

exports.removeComment = async (commentId) => {
  await commentModel.softDeleteComment(commentId);
};
