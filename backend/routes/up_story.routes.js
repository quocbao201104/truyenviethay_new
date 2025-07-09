const express = require("express");
const router = express.Router();
const { uploadStory } = require("../controllers/up_story.controller"); // import uploadStory
const upload = require("../middleware/upload_img"); // dùng multer
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { validateUpStory } = require("../validators/story.validator");

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "author"), // chỉ admin và tác giả mới được phép
  upload.single("bia_truyen"), // Multer middleware để xử lý file upload
  validateUpStory,
  uploadStory
); // Tải lên truyện mới

module.exports = router;
