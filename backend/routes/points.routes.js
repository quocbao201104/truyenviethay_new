const express = require("express");
const router = express.Router();
const pointsController = require("../controllers/userPoint.controller");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Route lấy điểm của người dùng
router.get("/:userId", authenticateToken, pointsController.getUserPoints);

// Route cập nhật điểm cho người dùng
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  pointsController.updatePoints
);

module.exports = router;
