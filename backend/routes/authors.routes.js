const express = require("express");
const router = express.Router();
const authorsController = require("../controllers/authors.controller");
const { authenticateToken, optionalAuthenticateToken } = require("../middleware/auth");

// Public ranking list
router.get("/top", authorsController.getTopAuthors);

// Update own author profile (pen_name, bio)
router.patch("/me", authenticateToken, authorsController.updateMyAuthorProfile);

// Public author profile (optional auth for is_followed)
router.get("/:authorId", optionalAuthenticateToken, authorsController.getAuthorById);

// Toggle follow author
router.post("/:authorId/follow", authenticateToken, authorsController.toggleFollowAuthor);

// Update author profile (pen_name, bio)
router.patch("/:authorId", authenticateToken, authorsController.updateAuthorProfile);

module.exports = router;
