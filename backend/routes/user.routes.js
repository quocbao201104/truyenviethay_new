// backend/routes/user.routes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    userController.getAllUsers
);

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    userController.getUserById
);

router.put(
    "/:id/ban",
    authenticateToken,
    authorizeRoles("admin"),
    userController.banUser
);

router.put(
    "/:id/unban",
    authenticateToken,
    authorizeRoles("admin"),
    userController.unbanUser
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    userController.deleteUser
);

// THÊM ROUTE NÀY: Cập nhật vai trò người dùng
router.put(
    "/:id/role", 
    authenticateToken,
    authorizeRoles("admin"),
    userController.updateUserRole
);

module.exports = router;