const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
// const { validateAddComment } = require("../validators/comment.validator");

// Lấy danh sách comment theo truyện
router.get("/", commentController.getComments);

// Tạo comment (cần đăng nhập)
router.post("/", authenticateToken, commentController.createComment);

// Xóa comment (chỉ admin)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  commentController.deleteComment
);

module.exports = router;
