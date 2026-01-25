const express = require("express");
const router = express.Router();
const { uploadStory } = require("../controllers/up_story.controller"); 
const upload = require("../middleware/upload_img"); 
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
// const { validateUpStory } = require("../validators/story.validator");

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "author"), 
  upload.single("anh_bia"),
  uploadStory
); 

module.exports = router;
