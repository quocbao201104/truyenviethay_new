const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { authenticateToken } = require("../middleware/auth");

router.get("/", authenticateToken, notificationController.getNotifications);
router.put("/read-all", authenticateToken, notificationController.markAllAsRead);
router.put("/:id/read", authenticateToken, notificationController.markAsRead);

module.exports = router;
