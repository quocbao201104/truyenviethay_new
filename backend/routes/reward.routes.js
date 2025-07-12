const express = require("express");
const router = express.Router();
const rewardController = require("../controllers/reward.controller");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Route lấy tất cả phần thưởng
router.get("/", authenticateToken, rewardController.getAllRewards);

// Route tạo phần thưởng mới
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  rewardController.createReward
);

module.exports = router;
