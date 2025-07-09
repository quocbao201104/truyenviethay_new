const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const banUserUntil = require("../controllers/banUntil"); // import hàm ban user
const upload = require("../middleware/upload_img"); // dùng multer
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const {
  validateRegister,
  validateLogin,
  validateUpdateUser,
} = require("../validators/auth.validator");

router.post("/dang-ky", validateRegister, authController.register);
router.post("/dang-nhap", validateLogin, authController.login);
router.get("/me", authenticateToken, authController.getMe);

router.get(
  "/users/:id",
  authenticateToken,
  authorizeRoles("admin"),
  authController.getUserById
); // Lấy thông tin người dùng theo ID

router.get(
  "/all-users",
  authenticateToken,
  authorizeRoles("admin"),
  authController.getAllUsers // Lấy danh sách tất cả người dùng
);

router.put("change-password", authenticateToken, authController.changePassword); // Đổi mật khẩu

router.put(
  "/me",
  authenticateToken,
  upload.single("avatar"),
  validateUpdateUser,
  authController.updateMe
); // Cập nhật thông tin người dùng

router.put(
  "/ban-user",
  authenticateToken,
  authorizeRoles("admin"),
  banUserUntil.banUser
); // Ban người dùng

router.delete(
  "/users/:id",
  authenticateToken,
  authorizeRoles("admin"), // Chỉ admin được quyền xóa
  authController.deleteUser
); // Xóa người dùng (trừ tác giả)

module.exports = router;
