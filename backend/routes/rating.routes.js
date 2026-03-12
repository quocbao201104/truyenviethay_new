const express = require("express");
const router = express.Router();
const RatingController = require("../controllers/rating.controller");
const { authenticateToken } = require("../middleware/auth");
const { ratingLimiter } = require("../middleware/rateLimiters");
const { validateCreateRating } = require("../validators/rating.validator");

router.post("/", authenticateToken, ratingLimiter, validateCreateRating, RatingController.createOrUpdateRating);
router.get("/top", RatingController.getTopRated);
router.get("/:truyenId", RatingController.getRatings);

module.exports = router;
