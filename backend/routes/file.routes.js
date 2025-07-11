const express = require("express");
const router = express.Router();
const fileController = require("../controllers/file.controller");
const upload = require("../middleware/upload_file");
const { authenticateToken } = require("../middleware/auth");
// const { validateUpStory } = require("../validators/story.validator");

router.post(
  "/",
  authenticateToken,
  upload.single("file"),
  fileController.uploadFile
);

module.exports = router;
