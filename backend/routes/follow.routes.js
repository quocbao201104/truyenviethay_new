// routes/follow.routes.js

const express = require("express");
const router = express.Router();
const followController = require("../controllers/follow.controller");
const { authenticateToken } = require("../middleware/auth"); 

// Lấy danh sách truyện theo dõi với phân trang
router.get("/", authenticateToken, followController.getFollowList);

// Toggle theo dõi
router.post("/:truyenId", authenticateToken, followController.toggleFollow);

module.exports = router;
