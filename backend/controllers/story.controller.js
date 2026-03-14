const StoryModel = require("../models/story.model");
const TheLoaiModel = require("../models/category.model");
const storyService = require("../services/story.services");
const followModel = require("../models/follow.model");
const readingStateModel = require("../models/readingState.model");
const generateSlug = require("../utils/slugify"); 
const db = require("../config/db"); // Import DB connection 
const { getOrSet, invalidate } = require("../utils/cache");

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
  ].join(":");
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
    };

    const cacheKey = allStoriesCacheKey(params);
    const result = await getOrSet(cacheKey, ALL_STORIES_CACHE_TTL_SECONDS, () =>
      StoryModel.getAll(params)
    );
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
      trang_thai,
      min_views,
      max_views,
      min_chapters,
      max_chapters
    } = req.query;

    const result = await StoryModel.getPublicStories({
      page,
      limit,
      sort_by,
      order,
      keyword,
      category_ids,
      trang_thai,
      min_views,
      max_views,
      min_chapters,
      max_chapters,
    });
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

    res.status(200).json(story);
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

    res.json(story);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
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
      return res
        .status(404)
        .json({ message: "Không tìm thấy truyện để cập nhật" });
    }

    // Authorization check
    const user = req.user;
    if (user.role !== "admin" && user.id !== existingStory.user_id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền sửa truyện này" });
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

    // console.log("Updating story data:", updatedData); // Removed for production

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
      return res.status(200).json({ message: "Cập nhật truyện thành công" });
    } else {
      return res
        .status(400)
        .json({ message: "Không có thay đổi nào được lưu lại" });
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật truyện:", error); // This will show detailed SQL error in server console
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
    res.status(200).json({ message: "Xoá truyện thành công" });
  } catch (error) {
    console.error("Lỗi khi xoá truyện:", error);
    res.status(500).json({ message: "Lỗi khi xoá truyện" });
  }
};

const getPendingApproval = async (req, res) => {
  try {
    const stories = await StoryModel.getPendingApproval();
    res.status(200).json(stories);
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
       // Note: StoryModel.getAll needs to be updated if it doesn't support sort params, 
       // but typically it defaults to updated_at. 
       // If you need specific sort, you might need to update getAll too.
    });

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
    res.json(stories);
  } catch (err) {
    console.error("Lỗi khi lấy truyện theo user:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const getTopMonthlyStories = async (req, res) => {
  try {
    const limit = req.query.limit;
    const result = await StoryModel.getTopMonthlyStories(limit);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    console.error("getTopMonthlyStories error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy top tháng" });
  }
};

const getHotStories = async (req, res) => {
  try {
    const limit = req.query.limit;
    const result = await StoryModel.getHotStories(limit);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    console.error("getHotStories error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy hot stories" });
  }
};

module.exports = {
  getAllStories,
  getStoryById,
  updateStory,
  deleteStory,
  getPendingApproval,
  approveOrRejectStory,
  getStoriesByUserId,
  getMyStories,
  getStoryBySlug,
  getPublicStories,
  getTopMonthlyStories,
  getHotStories,
};
