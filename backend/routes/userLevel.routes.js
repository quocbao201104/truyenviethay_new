const express = require("express");
const router = express.Router();
const levelController = require("../controllers/userLevel.controller");
const { authenticateToken } = require("../middleware/auth");

// Route lấy danh sách tất cả cấp bậc
router.get("/", authenticateToken, levelController.getAllLevels);

// Route lấy cấp bậc theo ID
router.get("/:id", authenticateToken, levelController.getLevelById);

module.exports = router;
