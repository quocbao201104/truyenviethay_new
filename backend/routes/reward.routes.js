const express = require("express");
const router = express.Router();
const rewardController = require("../controllers/reward.controller");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

router.get("/", authenticateToken, rewardController.getAllRewards);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  rewardController.createReward
);

module.exports = router;
