const express = require("express");
const router = express.Router();
const likeController = require("../controllers/like.controller");
const { authenticateToken } = require("../middleware/auth");

router.get("/:id", authenticateToken, likeController.getLikeStatus); // GET trạng thái like
router.post("/:id", authenticateToken, likeController.toggleLike); // POST toggle like

module.exports = router;
