const StoryModel = require("../models/story.model");
const TheLoaiModel = require("../models/category.model");
const storyService = require("../services/story.services");
const followModel = require("../models/follow.model");
const readingStateModel = require("../models/readingState.model");
const InventoryModel = require("../models/inventory.model");
const generateSlug = require("../utils/slugify"); 
const db = require("../config/db"); // Import DB connection 
const { getOrSet, invalidate } = require("../utils/cache");
const storyAudioService = require("../services/storyAudio.service");
const { resolveAudioUrl } = require("../utils/audioUrl");

const STORY_DETAIL_CACHE_TTL_SECONDS = 600; // 10 phút
const ALL_STORIES_CACHE_TTL_SECONDS = 600; // 10 phút

const safeKeyPart = (value) =>
  encodeURIComponent(value === undefined || value === null ? "" : String(value));
const toIntOrUndefined = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const storyDetailIdKey = (id) => `storyDetail:id:${id}`;
const storyDetailSlugKey = (slug) => `storyDetail:slug:${slug}`;
const storyAudioMetaKey = (id) => `storyAudio:meta:id:${id}`;
const storyAudioPlaylistKey = (id) => `storyAudio:playlist:id:${id}`;
const invalidateStoryAudioCache = async (storyId) => {
  await invalidate(storyAudioMetaKey(storyId));
  await invalidate(storyAudioPlaylistKey(storyId));
};
const allStoriesCacheKey = (params) => {
  const {
    page,
    limit,
    trang_thai_kiem_duyet,
    keyword,
    author_id,
    category_id,
    sort_by,
    order,
    has_audio,
    require_text_chapters,
  } = params;

  return [
    "storyListAll",
    `page=${safeKeyPart(page)}`,
    `limit=${safeKeyPart(limit)}`,
    `trang_thai_kiem_duyet=${safeKeyPart(trang_thai_kiem_duyet)}`,
    `keyword=${safeKeyPart(keyword)}`,
    `author_id=${safeKeyPart(author_id)}`,
    `category_id=${safeKeyPart(category_id)}`,
    `sort_by=${safeKeyPart(sort_by)}`,
    `order=${safeKeyPart(order)}`,
    `has_audio=${safeKeyPart(has_audio)}`,
    `require_text_chapters=${safeKeyPart(require_text_chapters)}`,
  ].join(":");
};

const normalizeStory = (story) => {
  if (!story) return story;
  if (typeof story.genres === "string") {
    try {
      story.genres = JSON.parse(story.genres);
    } catch {
      story.genres = [];
    }
  }
  if (!Array.isArray(story.genres)) {
    story.genres = [];
  }
  if (story.thoi_gian_cap_nhat && typeof story.thoi_gian_cap_nhat === 'string') {
    story.thoi_gian_cap_nhat = story.thoi_gian_cap_nhat.replace(" ", "T") + "Z";
  }
  if (story.thoi_gian_tao && typeof story.thoi_gian_tao === 'string') {
    story.thoi_gian_tao = story.thoi_gian_tao.replace(" ", "T") + "Z";
  }
  return story;
};

const normalizeStories = (stories) => {
  if (!Array.isArray(stories)) return stories;
  return stories.map(normalizeStory);
};

const getAllStories = async (req, res) => {
  try {
    const {
      page,
      limit,
      trang_thai_kiem_duyet,
      keyword,
      author_id,
      category_id,
      sort_by,
      order,
      has_audio,
      require_text_chapters,
    } = req.query;

    const safePage = toIntOrUndefined(page) ?? 1;
    const safeLimit = toIntOrUndefined(limit) ?? 10;
    const params = {
      page: safePage,
      limit: safeLimit,
      trang_thai_kiem_duyet,
      keyword,
      author_id: toIntOrUndefined(author_id),
      category_id: toIntOrUndefined(category_id),
      sort_by,
      order,
      has_audio,
      require_text_chapters,
    };

    const cacheKey = allStoriesCacheKey(params);
    const result = await getOrSet(cacheKey, ALL_STORIES_CACHE_TTL_SECONDS, () =>
      StoryModel.getAll(params)
    );
    if (result && result.data) {
      result.data = normalizeStories(result.data);
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách truyện (Admin):", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách truyện" });
  }
};

const getPublicStories = async (req, res) => {
  try {
    const { 
      page, 
      limit, 
      sort_by, 
      order, 
      keyword, 
      category_ids, // Expecting comma-separated string or array
      author_id,
      trang_thai,
      min_views,
      max_views,
      min_chapters,
      max_chapters,
      min_days_ago,
      has_audio,
      is_hot,
      require_text_chapters,
    } = req.query;

    const result = await StoryModel.getPublicStories({
      page,
      limit,
      sort_by,
      order,
      keyword,
      category_ids,
      author_id,
      trang_thai,
      min_views,
      max_views,
      min_chapters,
      max_chapters,
      min_days_ago,
      has_audio,
      is_hot,
      require_text_chapters,
    });
    if (result && result.data) {
      result.data = normalizeStories(result.data);
    }
    res.json(result);
  } catch (err) {
    console.error("Lỗi khi lấy truyện public:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const attachUserContext = async (story, userId) => {
  if (!userId) return;
  const [rows] = await followModel.isFollowing(userId, story.id);
  const readingState = await readingStateModel.getByUserAndStory(userId, story.id);
  story.is_followed = (rows?.length || 0) > 0;
  story.last_read_chuong_id = readingState?.last_read_chuong_id ?? null;
};

const attachAuthorRewards = async (stories) => {
  if (!Array.isArray(stories) || stories.length === 0) return;
  const userIds = stories
    .map((story) => story.user_id)
    .filter((id) => Number.isFinite(parseInt(id, 10)));

  if (userIds.length === 0) return;

  const [equippedBadgesMap, equippedFramesMap] = await Promise.all([
    InventoryModel.getEquippedBadgesForUsers(userIds),
    InventoryModel.getEquippedAvatarFramesForUsers(userIds),
  ]);

  for (const story of stories) {
    const userId = story.user_id;
    story.badge = equippedBadgesMap.get(userId) || null;
    story.equipped_frame = equippedFramesMap.get(userId) || null;
  }
};

const getStoryById = async (req, res) => {
  try {
    const storyId = req.params.id;
    const cacheKey = storyDetailIdKey(storyId);
    const cachedStory = await getOrSet(cacheKey, STORY_DETAIL_CACHE_TTL_SECONDS, async () => {
      const story = await StoryModel.getById(storyId);
      if (!story) return null;
      story.genres = await TheLoaiModel.getByStoryId(storyId);
      return story;
    });

    if (!cachedStory) {
      return res.status(404).json({ message: "Không tìm thấy truyện" });
    }

    const story = {
      ...cachedStory,
      genres: Array.isArray(cachedStory.genres) ? [...cachedStory.genres] : cachedStory.genres,
    };
    if (req.user?.id) await attachUserContext(story, req.user.id);

    res.status(200).json(normalizeStory(story));
  } catch (error) {
    console.error("Lỗi khi lấy truyện theo ID:", error);
    res.status(500).json({ message: "Lỗi khi lấy truyện" });
  }
};

const getStoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const cacheKey = storyDetailSlugKey(slug);
    const cachedStory = await getOrSet(cacheKey, STORY_DETAIL_CACHE_TTL_SECONDS, async () => {
      const story = await StoryModel.getBySlug(slug);
      if (!story) return null;
      story.genres = await TheLoaiModel.getByStoryId(story.id);
      return story;
    });

    if (!cachedStory) {
      return res.status(404).json({ message: "Không tìm thấy truyện" });
    }

    const story = {
      ...cachedStory,
      genres: Array.isArray(cachedStory.genres) ? [...cachedStory.genres] : cachedStory.genres,
    };
    if (req.user?.id) await attachUserContext(story, req.user.id);

    res.json(normalizeStory(story));
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

const getStorySampleChapter = async (req, res) => {
  try {
    const storyId = req.params.id;
    const story = await StoryModel.getById(storyId);
    if (!story) {
      return res.status(404).json({ message: "KhÃ´ng tÃ¬m tháº¥y truyá»‡n" });
    }
    const sampleContent = await StoryModel.getSampleChapter(storyId);
    res.json({ sample_chapter_content: sampleContent });
  } catch (error) {
    console.error("Lỗi khi lấy chương mẫu:", error);
    res.status(500).json({ message: "Lỗi khi lấy chương mẫu" });
  }
};

const getStoryAudioById = async (req, res) => {
  try {
    const storyId = req.params.id;
    const story = await StoryModel.getById(storyId);

    if (!story) {
      return res.status(404).json({ message: "Không tìm thấy truyện" });
    }

    const response = await storyAudioService.buildAudioResponse(story, req.user?.id);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi khi lấy audio theo story ID:", error);
    return res.status(500).json({ message: "Lỗi khi lấy danh sách audio" });
  }
};

const getStoryAudioBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const story = await StoryModel.getBySlug(slug);

    if (!story) {
      return res.status(404).json({ message: "Không tìm thấy truyện" });
    }

    const response = await storyAudioService.buildAudioResponse(story, req.user?.id);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi khi lấy audio theo slug:", error);
    return res.status(500).json({ message: "Lỗi khi lấy danh sách audio" });
  }
};

const saveStoryAudioProgress = async (req, res) => {
  try {
    const toSafeInteger = (value) => {
      if (typeof value === "number") {
        return Number.isSafeInteger(value) ? value : undefined;
      }

      if (typeof value !== "string" || !/^-?\d+$/.test(value)) {
        return undefined;
      }

      const parsed = Number(value);
      return Number.isSafeInteger(parsed) ? parsed : undefined;
    };

    const storyId = toSafeInteger(req.params.id);
    const userId = req.user?.id;
    const lastPartId = toSafeInteger(req.body?.last_part_id);

    if (!userId) {
      return res.status(401).json({ message: "Vui long dang nhap de luu tien do audio." });
    }

    if (!Number.isSafeInteger(storyId) || !Number.isSafeInteger(lastPartId)) {
      return res.status(400).json({ message: "Du lieu luu tien do khong hop le." });
    }

    const story = await StoryModel.getById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Khong tim thay truyen." });
    }

    const audioPart = await StoryModel.getAudioPartByIdAndStory(lastPartId, storyId);
    if (!audioPart) {
      return res.status(400).json({ message: "Tap audio khong thuoc truyen nay." });
    }

    const progress = await StoryModel.saveAudioProgress(userId, storyId, lastPartId);

    return res.status(200).json({
      success: true,
      progress: progress
        ? {
            user_id: progress.user_id,
            truyen_id: progress.truyen_id,
            last_part_id: progress.last_part_id,
            updated_at: progress.updated_at,
            part_number: progress.part_number,
            audio_url: resolveAudioUrl(progress.audio_url, progress.r2_key),
            video_id: progress.video_id,
            youtube_video_id: progress.youtube_video_id,
            video_index: progress.video_index,
          }
        : null,
    });
  } catch (error) {
    console.error("Loi khi luu tien do audio:", error);
    return res.status(500).json({ message: "Loi khi luu tien do audio." });
  }
};

const updateStory = async (req, res) => {
  const storyId = req.params.id;
  const { 
    ten_truyen, 
    tac_gia, 
    mo_ta, 
    trang_thai,
    link_nguon,
    age_rating,
    delete_cover_image 
  } = req.body;

  try {
    const existingStory = await StoryModel.getById(storyId);
    if (!existingStory) {
      return res.status(404).json({ message: "Không tìm thấy truyện để cập nhật" });
    }

    // Authorization check
    const user = req.user;
    if (user.role !== "admin" && user.id !== existingStory.user_id) {
      return res.status(403).json({ message: "Bạn không có quyền sửa truyện này" });
    }

    // Generate slug from story name
    const nameToSlug = ten_truyen || existingStory.ten_truyen;
    if (!nameToSlug) {
      throw new Error("Tên truyện không hợp lệ để tạo slug");
    }
    const slug = generateSlug(nameToSlug);

    // Initialize updatedData with basic fields
    const updatedData = {
      ten_truyen: ten_truyen || existingStory.ten_truyen,
      tac_gia: tac_gia || existingStory.tac_gia,
      mo_ta: mo_ta || existingStory.mo_ta,
      trang_thai: trang_thai || existingStory.trang_thai,
      slug,
      thoi_gian_cap_nhat: new Date(),
    };

    // Handle cover image (file upload / deletion / keep existing)
    if (req.file) {
      updatedData.anh_bia = req.file.path; 
    } else if (delete_cover_image === 'true') {
      updatedData.anh_bia = null; // Explicitly delete cover
    } else {
      updatedData.anh_bia = existingStory.anh_bia || null; // Keep existing
    }

    // Add remaining fields
    updatedData.link_nguon = link_nguon || null;
    updatedData.age_rating = age_rating || 1;

    const affectedRows = await StoryModel.update(storyId, updatedData);
    
    // Update categories (genres) if provided
    let theloaiIds = req.body.theloai_ids || req.body['theloai_ids[]'];
    
    if (theloaiIds) {
      if (!Array.isArray(theloaiIds)) {
        theloaiIds = [theloaiIds]; // Convert single value to array
      }
      
      theloaiIds = theloaiIds.filter(id => id); // Remove empty values
      
      if (theloaiIds.length > 0) {
        // Delete old categories and add new ones
        await db.query('DELETE FROM truyen_theloai WHERE truyen_id = ?', [storyId]);
        await StoryModel.addGenresForStory(storyId, theloaiIds);
      }
    }
    
    if (affectedRows > 0) {
      await StoryModel.invalidateStoryListCache?.();
      await invalidate(storyDetailIdKey(storyId));
      if (existingStory?.slug) await invalidate(storyDetailSlugKey(existingStory.slug));
      if (slug && slug !== existingStory?.slug) await invalidate(storyDetailSlugKey(slug));
      await invalidateStoryAudioCache(storyId);
      return res.status(200).json({ message: "Cập nhật truyện thành công" });
    } else {
      return res.status(400).json({ message: "Không có thay đổi nào được lưu lại" });
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật truyện:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật truyện: " + error.message });
  }
};

const deleteStory = async (req, res) => {
  try {
    const storyId = req.params.id;

    const existingStory = await StoryModel.getById(storyId);
    if (!existingStory) {
      return res.status(404).json({ message: "Không tìm thấy truyện để xoá" });
    }

    const user = req.user;
    if (user.role !== "admin" && user.id !== existingStory.user_id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xoá truyện này" });
    }

    const affectedRows = await StoryModel.delete(storyId);
    await StoryModel.invalidateStoryListCache?.();
    await invalidate(storyDetailIdKey(storyId));
    if (existingStory?.slug) await invalidate(storyDetailSlugKey(existingStory.slug));
    await invalidateStoryAudioCache(storyId);
    res.status(200).json({ message: "Xoá truyện thành công" });
  } catch (error) {
    console.error("Lỗi khi xoá truyện:", error);
    res.status(500).json({ message: "Lỗi khi xoá truyện" });
  }
};

const getPendingApprovalNormalized = async (req, res) => {
  try {
    const stories = await StoryModel.getPendingApproval();
    res.status(200).json(normalizeStories(stories));
  } catch (err) {
    console.error("Lỗi khi lấy truyện chờ duyệt:", err);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy truyện chờ duyệt", error: err.message });
  }
};

const approveOrRejectStory = async (req, res) => {
  const { action } = req.body;
  const storyId = req.params.id;

  if (!action) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp hành động (duyet/tu_choi)." });
  }

  try {
    const result = await storyService.approveStory(storyId, action);
    await StoryModel.invalidateStoryListCache?.();
    await invalidate(storyDetailIdKey(storyId));
    const existingStory = await StoryModel.getById(storyId);
    if (existingStory?.slug) await invalidate(storyDetailSlugKey(existingStory.slug));
    await invalidateStoryAudioCache(storyId);
    res.json(result);
  } catch (error) {
    console.error("Error in approveOrRejectStory:", error);
    res.status(500).json({ message: "Có lỗi xảy ra!" });
  }
};

const getMyStories = async (req, res) => {
  const userId = req.user.id;
  const { page, limit, trang_thai_kiem_duyet, keyword, category_id, sort_by, order } = req.query;

  try {
    const result = await StoryModel.getAll({
       page: parseInt(page) || 1,
       limit: parseInt(limit) || 10,
       trang_thai_kiem_duyet,
       keyword,
       author_id: userId, // Enforce author_id from token
       category_id: parseInt(category_id),
    });

    if (result && result.data) {
      result.data = normalizeStories(result.data);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Lỗi khi lấy truyện cá nhân:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const getStoriesByUserId = async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "User ID không hợp lệ" });
  }

  try {
    const stories = await StoryModel.getByAuthor(userId);
    if (!stories || stories.length === 0) {
      return res
        .status(200)
        .json({ message: "Người dùng này chưa đăng truyện nào." });
    }
    res.json(normalizeStories(stories));
  } catch (err) {
    console.error("Lỗi khi lấy truyện theo user:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const getTopMonthlyStories = async (req, res) => {
  try {
    const limit = req.query.limit;
    const result = await StoryModel.getTopMonthlyStories(limit);
    if (result.data) {
      await attachAuthorRewards(result.data);
      result.data = normalizeStories(result.data);
    }
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    console.error("getTopMonthlyStories error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy top tháng" });
  }
};

const getTopWeeklyStories = async (req, res) => {
  try {
    const limit = req.query.limit;
    const result = await StoryModel.getTopWeeklyStories(limit);
    if (result.data) {
      await attachAuthorRewards(result.data);
      result.data = normalizeStories(result.data);
    }
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    console.error("getTopWeeklyStories error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy top tuần" });
  }
};

const getTopDailyStories = async (req, res) => {
  try {
    const limit = req.query.limit;
    const result = await StoryModel.getTopDailyStories(limit);
    if (result.data) {
      await attachAuthorRewards(result.data);
      result.data = normalizeStories(result.data);
    }
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    console.error("getTopDailyStories error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy top ngày" });
  }
};

const getHotStories = async (req, res) => {
  try {
    const limit = req.query.limit;
    const result = await StoryModel.getHotStories(limit);
    if (result && result.data) {
      result.data = normalizeStories(result.data);
    }
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    console.error("getHotStories error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy hot stories" });
  }
};

module.exports = {
  getAllStories,
  getStoryById,
  getStoryAudioById,
  getStoryAudioBySlug,
  saveStoryAudioProgress,
  updateStory,
  deleteStory,
  getPendingApproval: getPendingApprovalNormalized,
  approveOrRejectStory,
  getStoriesByUserId,
  getMyStories,
  getStoryBySlug,
  getPublicStories,
  getStorySampleChapter,
  getTopMonthlyStories,
  getTopWeeklyStories,
  getTopDailyStories,
  getHotStories,
};
