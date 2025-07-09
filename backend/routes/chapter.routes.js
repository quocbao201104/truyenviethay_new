const express = require("express");
const router = express.Router();
const chapterController = require("../controllers/chapter.controller");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const {
  validateCreateChapter,
  validateUpdateChapter,
} = require("../validators/chapter.validator"); // import validator

router.post(
  "/",
  authenticateToken,
  authorizeRoles("author", "admin"), // chỉ tác giả hoặc admin được thêm chương
  validateCreateChapter,
  chapterController.createChapter
); // Tạo chương mới (chỉ admin và tác giả mới được tạo chương)

// Lấy danh sách chương theo truyện (có phân trang)
router.get("/truyen/:id", chapterController.getChaptersByStoryId);

// Lấy chi tiết 1 chương theo ID
router.get("/:id", chapterController.getChapterById);

router.get("/slug/:slug", chapterController.getChapterBySlug); //
// Lấy chi tiết 1 chương theo slug

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "author"),
  validateUpdateChapter,
  chapterController.updateChapter
); // Cập nhật chương theo ID (chỉ admin và tác giả mới được cập nhật)

// Duyệt hoặc từ chối chương (Admin)
router.put(
  "/:id/duyet-chuong",
  authenticateToken,
  authorizeRoles("admin"),
  chapterController.approveOrRejectChapter
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "author"),
  chapterController.deleteChapter
); // Xóa chương theo ID (chỉ admin và tác giả mới được xóa)

module.exports = router;
