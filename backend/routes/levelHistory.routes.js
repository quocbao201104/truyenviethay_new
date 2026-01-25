const express = require("express");
const router = express.Router();
const levelHistoryController = require("../controllers/userLevelHistory.controller");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Route lấy lịch sử cấp bậc của người dùng
router.get(
  "/:userId",
  authenticateToken,
  levelHistoryController.getHistoryByUserId
);

// Route thêm lịch sử cấp bậc
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  levelHistoryController.addHistory
);

router.post("/upgrade", authenticateToken, levelHistoryController.upgradeLevel);

module.exports = router;
