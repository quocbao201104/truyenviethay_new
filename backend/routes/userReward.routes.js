const express = require("express");
const router = express.Router();
const userRewardController = require("../controllers/userReward.controller");
const { authenticateToken } = require("../middleware/auth");

// Route lấy phần thưởng của người dùng
router.get("/:userId", authenticateToken, userRewardController.getUserRewards);

// Route nhận phần thưởng
router.post("/claim", authenticateToken, userRewardController.claimReward);

module.exports = router;
