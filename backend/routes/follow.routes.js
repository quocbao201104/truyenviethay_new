// routes/follow.routes.js

const express = require("express");
const router = express.Router();
const followController = require("../controllers/follow.controller");
const { authenticateToken } = require("../middleware/auth");
const { followLimiter } = require("../middleware/rateLimiters");
const { validateFollowTruyenId } = require("../validators/follow.validator");

// Lấy danh sách truyện theo dõi với phân trang
router.get("/", authenticateToken, followController.getFollowList);

// Toggle theo dõi - debounce 3s per (user, truyen)
router.post("/:truyenId", authenticateToken, followLimiter, validateFollowTruyenId, followController.toggleFollow);

module.exports = router;
