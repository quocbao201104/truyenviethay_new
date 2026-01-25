const express = require("express");
const router = express.Router();
const RatingController = require("../controllers/rating.controller");
const { authenticateToken } = require("../middleware/auth");

router.post("/", authenticateToken, RatingController.createOrUpdateRating);
router.get("/top", RatingController.getTopRated);
router.get("/:truyenId", RatingController.getRatings);

module.exports = router;
