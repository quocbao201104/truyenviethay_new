const ChapterModel = require("../models/chapter.model");
const chapterService = require("../services/chapter.sevices"); // Import service duyệt chương
const slugify = require("../ultils/slugify"); // Import hàm tạo slug

// Tác giả thêm chương mới (chờ duyệt)
const createChapter = async (req, res) => {
  try {
    const { truyen_id, so_chuong, tieu_de, noi_dung } = req.body;

    if (!truyen_id || !so_chuong || !tieu_de || !noi_dung) {
      return res.status(400).json({ message: "Thiếu thông tin chương!" });
    }

    const slug = slugify(tieu_de, { lower: true, strict: true });

    const result = await ChapterModel.createChapter({
      truyen_id,
      so_chuong,
      tieu_de,
      noi_dung,
      slug,
    });

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
  const { action } = req.body; // action có thể là 'duyet' hoặc 'tu_choi'
  const chapterId = req.params.id;

  if (!action) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp hành động (duyet/tu_choi)." });
  }

  try {
    const result = await chapterService.approveChapter(chapterId, action);
    res.json(result);
  } catch (error) {
    console.error("Error in approveOrRejectChapter:", error);
    res.status(500).json({ message: "Có lỗi xảy ra!" });
  }
};

// lấy danh sach chuong theo id truyen có phân trang , 20 chuong/1 trang
const getChaptersByStoryId = async (req, res) => {
  try {
    const truyen_id = parseInt(req.params.id); // đảm bảo là số
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    if (!truyen_id) {
      return res.status(400).json({ message: "Thiếu ID truyện!" });
    }

    const chapters = await ChapterModel.getChaptersByStoryId(
      truyen_id,
      limit,
      offset
    );
    res.json({ chapters });
  } catch (error) {
    console.error("getChaptersByStoryId error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách chương." });
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
    const { slug } = req.params;

    const chapter = await ChapterModel.getChapterBySlug(slug);

    if (!chapter) {
      return res.status(404).json({ message: "Không tìm thấy chương!" });
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
    const { tieu_de, noi_dung, so_chuong } = req.body;

    if (!tieu_de || !noi_dung || !so_chuong) {
      return res.status(400).json({ message: "Thiếu thông tin cập nhật!" });
    }

    const slug = slugify(tieu_de, { lower: true, strict: true });

    const affected = await ChapterModel.updateChapter(chapterId, {
      tieu_de,
      noi_dung,
      so_chuong,
      slug,
    });

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

    const affected = await ChapterModel.deleteChapter(chapterId);

    if (affected === 0) {
      return res.status(404).json({ message: "Không tìm thấy chương!" });
    }

    res.json({ message: "Xóa chương thành công!" });
  } catch (error) {
    console.error("deleteChapter error:", error);
    res.status(500).json({ message: "Lỗi server khi xóa chương." });
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
};
