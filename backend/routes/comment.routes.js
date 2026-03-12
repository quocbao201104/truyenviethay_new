const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");
const { authenticateToken } = require("../middleware/auth");
const { commentLimiter } = require("../middleware/rateLimiters");
const { validateAddComment, validateGetComments } = require("../validators/comment.validator");

// Lấy danh sách comment theo truyện
router.get("/", validateGetComments, commentController.getComments);

// Tạo comment (cần đăng nhập) - limiter 10/min per user
router.post("/", authenticateToken, commentLimiter, validateAddComment, commentController.createComment);

// Xóa comment — admin | author | chủ comment (15p hoặc chưa có reply)
router.delete("/:id", authenticateToken, commentController.deleteComment);

module.exports = router;
