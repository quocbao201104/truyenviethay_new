// backend/routes/user.routes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const authController = require("../controllers/auth.controller");
const uploadAvatar = require("../middleware/upload_avatar"); // Đảm bảo đường dẫn này đúng

// Route để cập nhật thông tin người dùng (bao gồm avatar)
// Sử dụng uploadAvatar.single('avatar') cho một file duy nhất
router.put(
  "/me",
  authenticateToken,
  uploadAvatar.single("avatar"),
  authController.updateMe
);
router.post(
  "/me",
  authenticateToken,
  uploadAvatar.single("avatar"),
  authController.updateMe
);

// Các route khác giữ nguyên
router.get("/me", authenticateToken, authController.getMe);
router.put(
  "/change-password",
  authenticateToken,
  authController.changePassword
);

module.exports = router;

