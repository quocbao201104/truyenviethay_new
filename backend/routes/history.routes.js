const express = require("express");
const router = express.Router();
const historyController = require("../controllers/history.controller");
const { authenticateToken } = require("../middleware/auth");

router.get("/", authenticateToken, historyController.getReadingHistory);

module.exports = router;
