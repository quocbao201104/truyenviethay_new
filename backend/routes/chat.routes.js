const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
logger.info("Initializing Chat Routes...");
const ChatController = require("../controllers/chat.controller");
const { authenticateToken } = require("../middleware/auth");

/**
 * Chat System Routes
 */

// Send Megaphone (World Chat - Paid)
router.post("/world", authenticateToken, ChatController.sendMegaphone);

// Get Room History (Redis Buffer)
router.get("/history/:roomId", authenticateToken, ChatController.getRoomHistory);

// Get Online Stats
router.get("/online-stats", authenticateToken, ChatController.getOnlineStats);

// Check if specific users are online
router.post("/check-online", authenticateToken, ChatController.checkOnlineStatus);

// Author Chat (Redis Optimized)
router.post("/author/:authorId", authenticateToken, ChatController.sendAuthorMessage);
router.get("/author/history/:authorId", authenticateToken, ChatController.getAuthorRoomHistory);

module.exports = router;
