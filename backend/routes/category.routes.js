// routes/category.route.js
const express = require("express");
const router = express.Router();
const theLoaiController = require("../controllers/category.controller");

router.get("/", theLoaiController.getAllTheLoai);
router.get("/by-truyen/:storyId", theLoaiController.getGenresByStory);
router.get("/filter", theLoaiController.filterStoriesByGenres);

module.exports = router;
