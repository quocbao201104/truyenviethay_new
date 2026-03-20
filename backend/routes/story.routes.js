const express = require("express");
const router = express.Router();
const storyController = require("../controllers/story.controller");
const uploadStoryController = require("../controllers/up_story.controller.js");
const { authenticateToken, authorizeRoles, optionalAuthenticateToken } = require("../middleware/auth");
const upload = require("../middleware/upload_img"); 

// Lấy tất cả truyện (Dành cho Admin hoặc tham khảo)
router.get("/", storyController.getAllStories);

// Lấy truyện public đã duyệt (dành cho frontend)
router.get("/public", storyController.getPublicStories);

// Top tháng
router.get("/top-thang", storyController.getTopMonthlyStories);
// Top tuần
router.get("/top-tuan", storyController.getTopWeeklyStories);
// Top ngày
router.get("/top-ngay", storyController.getTopDailyStories);

// Hot stories (dùng cho Banner/HeroGrid - order by hot_score)
router.get("/hot-stories", storyController.getHotStories);

// Admin xem truyện theo userId
router.get(
  "/theo-user/:userId",
  authenticateToken,
  authorizeRoles("admin"),
  storyController.getStoriesByUserId
);

// tác giả xem truyện của mình
router.get(
  "/truyen-cua-toi",
  authenticateToken,
  authorizeRoles("author", "admin"),
  storyController.getMyStories
);

// Lấy truyện chờ duyệt (Admin)
router.get(
  "/cho-duyet",
  authenticateToken,
  authorizeRoles("admin"),
  storyController.getPendingApproval
);

// Lấy truyện theo ID (optional auth)
router.get("/:id", optionalAuthenticateToken, storyController.getStoryById);

// Lấy chương mẫu của truyện
router.get("/:id/sample-chapter", storyController.getStorySampleChapter);

// Lấy truyện theo slug
router.get("/slug/:slug", optionalAuthenticateToken, storyController.getStoryBySlug);
router.get("/slug/:slug/audio", optionalAuthenticateToken, storyController.getStoryAudioBySlug);
router.get("/:id/audio", optionalAuthenticateToken, storyController.getStoryAudioById);
router.post("/:id/audio-progress", authenticateToken, storyController.saveStoryAudioProgress);

// Cập nhật truyện
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "author"),
  upload.single('anh_bia'),
  storyController.updateStory
);

// Xoá truyện
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "author"),
  storyController.deleteStory
);

// Duyệt hoặc từ chối truyện (Admin)
router.put(
  "/:id/duyet-truyen",
  authenticateToken,
  authorizeRoles("admin"),
  storyController.approveOrRejectStory
);

// Định nghĩa route ĐĂNG TRUYỆN MỚI
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "author"),
  upload.single('anh_bia'), 
  uploadStoryController.uploadStory 
);

module.exports = router;
