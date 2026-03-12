const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
logger.info("Initializing Chat Routes...");
const ChatController = require("../controllers/chat.controller");
const { authenticateToken } = require("../middleware/auth");

/**
 * Chat System Routes
 */

// Check if current user has Loa Truyền Âm item (client-side button gate)
router.get("/megaphone-access", authenticateToken, ChatController.getMegaphoneAccess);

// Send Megaphone (World Chat - Paid LT)
router.post("/world", authenticateToken, ChatController.sendMegaphone);

// Send Megaphone (World Chat - Paid via Loa Truyền Âm Item)
router.post("/world/megaphone", authenticateToken, ChatController.sendMegaphoneItem);

// Get Room History (DB for world, Redis for author)
router.get("/history/:roomId", authenticateToken, ChatController.getRoomHistory);

// Get Online Stats
router.get("/online-stats", authenticateToken, ChatController.getOnlineStats);

// Check if specific users are online
router.post("/check-online", authenticateToken, ChatController.checkOnlineStatus);

// Author Chat (Redis Optimized)
router.post("/author/:authorId", authenticateToken, ChatController.sendAuthorMessage);
router.get("/author/history/:authorId", authenticateToken, ChatController.getAuthorRoomHistory);

module.exports = router;
