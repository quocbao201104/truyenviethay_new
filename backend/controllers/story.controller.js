const StoryModel = require("../models/story.model");
const storyService = require("../services/story.sevices");
const generateSlug = require("../ultils/slugify"); 

const getAllStories = async (req, res) => {
  try {
    const {
      page,
      limit,
      trang_thai_kiem_duyet,
      keyword,
      author_id,
      category_id,
    } = req.query;

    const result = await StoryModel.getAll({
      page: parseInt(page),
      limit: parseInt(limit),
       trang_thai_kiem_duyet,
       keyword,
       author_id: parseInt(author_id),
       category_id: parseInt(category_id),
       sort_by,
       order,
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách truyện (Admin):", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách truyện" });
  }
};

const getPublicStories = async (req, res) => {
  try {
    const { page, limit, sort_by, order, keyword } = req.query;
    const result = await StoryModel.getPublicStories({
      page,
      limit,
      sort_by,
      order,
      keyword,
    });
    res.json(result);
  } catch (err) {
    console.error("Lỗi khi lấy truyện public:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const getStoryById = async (req, res) => {
  try {
    const storyId = req.params.id;
    // Gọi StoryModel.getById để lấy thông tin chi tiết truyện và chương mẫu
    const story = await StoryModel.getById(storyId); 

    if (!story) {
      return res.status(404).json({ message: "Không tìm thấy truyện" });
    }

    res.status(200).json(story);
  } catch (error) {
    console.error("Lỗi khi lấy truyện theo ID:", error);
    res.status(500).json({ message: "Lỗi khi lấy truyện" });
  }
};

const getStoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const story = await StoryModel.getBySlug(slug);

    if (!story) {
      return res.status(404).json({ message: "Không tìm thấy truyện" });
    }

    res.json(story);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

const updateStory = async (req, res) => {
  const storyId = req.params.id;
  const { ten_truyen, tac_gia, mo_ta, trang_thai } = req.body;

  try {
    const existingStory = await StoryModel.getById(storyId);
    if (!existingStory) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy truyện để cập nhật" });
    }

    const user = req.user;
    if (user.role !== "admin" && user.id !== existingStory.user_id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền sửa truyện này" });
    }

    const slug = generateSlug(ten_truyen);

    const updatedData = {
      ten_truyen,
      tac_gia,
      mo_ta,
      trang_thai,
      slug,
      thoi_gian_cap_nhat: new Date(),
    };

    if (req.file) {
      updatedData.anh_bia = req.file.filename; // Chỉ lưu tên file
    } else {
      updatedData.anh_bia = existingStory.anh_bia; // Giữ nguyên ảnh bìa cũ nếu không có file mới
    }

    const affectedRows = await StoryModel.update(storyId, updatedData);
    if (affectedRows > 0) {
      return res.status(200).json({ message: "Cập nhật truyện thành công" });
    } else {
      return res
        .status(400)
        .json({ message: "Không có thay đổi nào được lưu lại" });
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật truyện:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật truyện" });
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
};