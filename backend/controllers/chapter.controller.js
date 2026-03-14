const ChapterModel = require("../models/chapter.model");
const StoryModel = require("../models/story.model");
const chapterService = require("../services/chapter.services"); 
const slugify = require("../utils/slugify"); 
const { uploadChapterJson } = require("../services/r2ChapterStorage.service");
const { getOrSet, invalidate } = require("../utils/cache");

const CHAPTER_LIST_CACHE_TTL_SECONDS = 600; // 10 phút

const chaptersByStoryKey = (storyId, page, limit) =>
  `chaptersByStory:${storyId}:p:${page}:l:${limit}`;
const chaptersByStoryKeyPrefix = (storyId) => `chaptersByStory:${storyId}`;
const storyDetailIdKey = (storyId) => `storyDetail:id:${storyId}`;
const storyDetailSlugKey = (slug) => `storyDetail:slug:${slug}`;

const invalidateStoryDetailCache = async (storyId) => {
  try {
    await invalidate(storyDetailIdKey(storyId));
    const story = await StoryModel.getById(storyId);
    if (story?.slug) await invalidate(storyDetailSlugKey(story.slug));
  } catch (err) {
    console.error("invalidateStoryDetailCache error:", err);
  }
};


// Tác giả thêm chương mới (chờ duyệt)
const createChapter = async (req, res) => {
  try {
    const { truyen_id, so_chuong, tieu_de, content } = req.body;

    if (!truyen_id || !so_chuong || !tieu_de || !content) {
      return res.status(400).json({ message: "Thiếu thông tin chương!" });
    }

    const slug = slugify(tieu_de, { lower: true, strict: true });

    const result = await ChapterModel.createChapter({
      truyen_id,
      so_chuong,
      tieu_de,
      slug,
    });

    try {
      const { contentUrl, contentHash, contentLength } = await uploadChapterJson({
        storyId: truyen_id,
        chapterId: result.chapter_id,
        title: tieu_de,
        content,
      });
      await ChapterModel.updateChapterContentMeta(result.chapter_id, {
        content_url: contentUrl,
        content_hash: contentHash,
        content_length: contentLength,
      });
    } catch (uploadErr) {
      await ChapterModel.deleteChapter(result.chapter_id);
      throw uploadErr;
    }

    res.status(201).json({
      message: "Đã gửi chương chờ duyệt!",
      chapter_id: result.chapter_id,
    });
  } catch (error) {
    console.error("createChapter error:", error);
    res.status(500).json({ message: "Lỗi server khi tạo chương." });
  }
};

// Duyệt chương
const approveOrRejectChapter = async (req, res) => {
  const { action, reason } = req.body;
  const chapterId = req.params.id;

  if (!action) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp hành động (duyet/tu_choi)." });
  }

  try {
    const result = await chapterService.approveChapter(chapterId, action, reason);
    res.json(result);
  } catch (error) {
    console.error("Error in approveOrRejectChapter:", error);
    res.status(500).json({ message: "Có lỗi xảy ra!" });
  }
};

// lấy danh sach chuong theo id truyen có phân trang , 20 chuong/1 trang
const getChaptersByStoryId = async (req, res) => {
  try {
    const truyen_id = parseInt(req.params.id); 
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    if (!truyen_id) {
      return res.status(400).json({ message: "Thiếu ID truyện!" });
    }

    const cacheKey = chaptersByStoryKey(truyen_id, page, limit);
    const chapters = await getOrSet(cacheKey, CHAPTER_LIST_CACHE_TTL_SECONDS, () =>
      ChapterModel.getChaptersByStoryId(truyen_id, limit, offset)
    );
    res.json({ chapters });
  } catch (error) {
    console.error("getChaptersByStoryId error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách chương." });
  }
};

// lấy danh sach toàn bộ chương cho admin (không filter đã duyệt)
const getAdminChaptersByStoryId = async (req, res) => {
  try {
    const truyen_id = parseInt(req.params.id); 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000; // Default large limit for admin management
    const offset = (page - 1) * limit;

    if (!truyen_id) {
      return res.status(400).json({ message: "Thiếu ID truyện!" });
    }

    const chapters = await ChapterModel.getAdminChaptersByStoryId(
      truyen_id,
      limit,
      offset
    );
    res.json({ chapters });
  } catch (error) {
    console.error("getAdminChaptersByStoryId error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách chương cho admin." });
  }
};

// Lấy chi tiết chương theo id
const getChapterById = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await ChapterModel.getChapterById(id);

    if (!chapter) {
      return res.status(404).json({ message: "Không tìm thấy chương!" });
    }

    res.json(chapter);
  } catch (error) {
    console.error("getChapterById error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy chi tiết chương." });
  }
};
// Lấy chi tiết chương theo slug
const getChapterBySlug = async (req, res) => {
  try {
    const { storySlug, chapterSlug } = req.params;

    const chapter = await ChapterModel.getChapterBySlug(chapterSlug, storySlug);

    if (!chapter) {
      return res.status(404).json({ message: "Không tìm thấy chương!" });
    }

    // Không cache endpoint động (có gamification + dữ liệu thay đổi)
    res.set("Cache-Control", "private, no-store");

    // VIEW TRACKING: Moved to separate endpoint /view

    // GAMIFICATION TRIGGER
    if (req.user && req.user.id) {
      try {
        const taskService = require("../services/task.service");
        const userId = req.user.id;

        const readStoryEvent = {
          eventType: "read_chapter",
          eventRef: `story:${chapter.truyen_id}:chapter:${chapter.id}`,
        };

        await taskService.completeTaskByName(userId, "Đọc truyện", readStoryEvent);

        if (chapter.so_chuong === 1) {
          const firstChapterEvent = {
            eventType: "read_first_chapter",
            eventRef: `story:${chapter.truyen_id}:first`,
          };

          await taskService.completeTaskByName(userId, "Đọc chương đầu tiên", firstChapterEvent);
        }

      } catch (e) {
        console.error("AutoTask Error:", e.message);
      }
    }

    res.json(chapter);

  } catch (error) {
    console.error("getChapterBySlug error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy chương theo slug." });
  }
};

// - Cập nhật chương
const updateChapter = async (req, res) => {
  try {
    const chapterId = req.params.id;
    const { tieu_de, content, so_chuong } = req.body;

    if (!tieu_de || !content || !so_chuong) {
      return res.status(400).json({ message: "Thiếu thông tin cập nhật!" });
    }

    const slug = slugify(tieu_de, { lower: true, strict: true });

    const existing = await ChapterModel.getChapterById(chapterId);
    if (!existing) {
      return res.status(404).json({ message: "Không tìm thấy chương!" });
    }

    const { contentUrl, contentHash, contentLength } = await uploadChapterJson({
      storyId: existing.truyen_id,
      chapterId: chapterId,
      title: tieu_de,
      content,
    });

    const affected = await ChapterModel.updateChapter(chapterId, {
      tieu_de,
      so_chuong,
      slug,
    });

    if (affected > 0) {
      await ChapterModel.updateChapterContentMeta(chapterId, {
        content_url: contentUrl,
        content_hash: contentHash,
        content_length: contentLength,
      });

      if (existing.trang_thai === "da_duyet") {
        await invalidate(chaptersByStoryKeyPrefix(existing.truyen_id));
        await invalidateStoryDetailCache(existing.truyen_id);
      }
    }

    if (affected === 0) {
      return res.status(404).json({ message: "Không tìm thấy chương!" });
    }

    res.json({ message: "Cập nhật chương thành công!" });
  } catch (error) {
    console.error("updateChapter error:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật chương." });
  }
};

//- Xóa chương
const deleteChapter = async (req, res) => {
  try {
    const chapterId = req.params.id;

    const existing = await ChapterModel.getChapterById(chapterId);
    const affected = await ChapterModel.deleteChapter(chapterId);

    if (affected === 0) {
      return res.status(404).json({ message: "Không tìm thấy chương!" });
    }

    if (affected > 0 && existing?.truyen_id) {
      await invalidate(chaptersByStoryKeyPrefix(existing.truyen_id));
      await invalidateStoryDetailCache(existing.truyen_id);
    }

    res.json({ message: "Xóa chương thành công!" });
  } catch (error) {
    console.error("deleteChapter error:", error);
    res.status(500).json({ message: "Lỗi server khi xóa chương." });
  }
};

// Duyệt tất cả chương của một truyện
const approveAllChapters = async (req, res) => {
  try {
    const truyen_id = parseInt(req.params.id);
    if (!truyen_id) {
      return res.status(400).json({ message: "Thiếu ID truyện!" });
    }
    const ChapterModel = require("../models/chapter.model");
    await ChapterModel.approveAllChapters(truyen_id);
    await invalidate(chaptersByStoryKeyPrefix(truyen_id));
    await invalidateStoryDetailCache(truyen_id);
    res.json({ message: "Đã duyệt tất cả chương của truyện này!" });
  } catch (error) {
    console.error("approveAllChapters error:", error);
    res.status(500).json({ message: "Lỗi server khi duyệt tất cả chương." });
  }
};

// Tăng lượt xem chương (Manual trigger từ Frontend)
const incrementChapterView = async (req, res) => {
  try {
    const chapterId = req.params.id;
    const ChapterModel = require("../models/chapter.model");
    const viewTrackingService = require("../services/viewTracking.service");

    const chapter = await ChapterModel.getChapterById(chapterId);

    if (!chapter) {
      return res.status(404).json({ message: "Không tìm thấy chương!" });
    }

    // Chỉ tracking cho chương đã duyệt
    if (chapter.trang_thai === "da_duyet") {
      const result = await viewTrackingService.recordChapterView(req, chapter.truyen_id, chapter.id);
      return res.json({ 
        message: "Ghi nhận linh khí (view) thành công.", 
        counted: result.counted,
        novelIncremented: result.novelIncremented
      });
    }

    res.json({ message: "Chương chưa khai mở, không tính linh khí." });
  } catch (error) {
    console.error("incrementChapterView error:", error);
    res.status(500).json({ message: "Lỗi server khi tăng lượt xem." });
  }
};

module.exports = {
  createChapter,
  getChaptersByStoryId,
  getChapterById,
  updateChapter,
  deleteChapter,
  approveOrRejectChapter,
  getChapterBySlug,
  getAdminChaptersByStoryId,
  approveAllChapters,
  incrementChapterView,
};
