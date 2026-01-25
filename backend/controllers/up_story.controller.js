const slugify = require("../utils/slugify");
const StoryModel = require("../models/story.model");
const ChapterModel = require("../models/chapter.model");
const notificationService = require("../services/notification.services");

const uploadStory = async (req, res) => {
  try {
    const data = req.body;
    const file = req.file;

    // Normalize theloai_ids to ensure it's an array
    if (!data.theloai_ids && data['theloai_ids[]']) {
         data.theloai_ids = data['theloai_ids[]'];
    }
    // If it's a single value (string), convert to array
    if (data.theloai_ids && !Array.isArray(data.theloai_ids)) {
        data.theloai_ids = [data.theloai_ids];
    }
    
    // Convert string IDs to numbers if needed (frontend sends strings in FormData)
    if (data.theloai_ids && Array.isArray(data.theloai_ids)) {
        data.theloai_ids = data.theloai_ids.map(id => parseInt(id)).filter(id => !isNaN(id));
    }

    if (!file) {
      return res.status(400).json({ message: "Ảnh bìa là bắt buộc" });
    }

    // Cập nhật logic validation để bao gồm các trường mới
    if (
      !data.ten_truyen ||
      data.ten_truyen.trim() === "" ||
      !data.tac_gia ||
      data.tac_gia.trim() === "" ||
      !data.mo_ta ||
      data.mo_ta.trim() === "" ||
      !data.muc_tieu ||
      data.muc_tieu.trim() === "" || // Thêm validation cho muc_tieu
      !data.doi_tuong_doc_gia ||
      data.doi_tuong_doc_gia.trim() === "" || // Thêm validation cho doi_tuong_doc_gia
      !data.chuong_mau ||
      data.chuong_mau.trim() === "" ||
      data.chuong_mau.trim() === "<p></p>" ||
      !data.theloai_ids ||
      !Array.isArray(data.theloai_ids) ||
      data.theloai_ids.length === 0
    ) {
      let missingField = "";
      if (!data.ten_truyen || data.ten_truyen.trim() === "")
        missingField = "Tên truyện";
      else if (!data.tac_gia || data.tac_gia.trim() === "")
        missingField = "Tác giả";
      else if (!data.mo_ta || data.mo_ta.trim() === "") missingField = "Mô tả";
      else if (!data.muc_tieu || data.muc_tieu.trim() === "")
        missingField = "Mục tiêu"; // Message cho muc_tieu
      else if (!data.doi_tuong_doc_gia || data.doi_tuong_doc_gia.trim() === "")
        missingField = "Đối tượng độc giả"; // Message cho doi_tuong_doc_gia
      else if (
        !data.chuong_mau ||
        data.chuong_mau.trim() === "" ||
        data.chuong_mau.trim() === "<p></p>"
      )
        missingField = "Nội dung chương mẫu";
      else if (
        !data.theloai_ids ||
        !Array.isArray(data.theloai_ids) ||
        data.theloai_ids.length === 0
      )
        missingField = "Thể loại";

      return res
        .status(400)
        .json({ message: `Vui lòng điền đầy đủ thông tin: ${missingField}` });
    }

    const anh_bia = file.path;
    const now = new Date();
    const user_id = req.user.id;
    const userRole = req.user.role;

    const slug = slugify(data.ten_truyen, { lower: true, strict: true });

    let trang_thai_kiem_duyet = "cho_duyet";
    if (userRole === "admin") {
      trang_thai_kiem_duyet = "duyet";
    }

    const storyId = await StoryModel.create({
      ten_truyen: data.ten_truyen,
      slug,
      tac_gia: data.tac_gia,
      mo_ta: data.mo_ta,
      trang_thai: data.trang_thai || "dang_ra",
      tinh_trang: data.tinh_trang || "Đang viết",
      trang_thai_viet: data.trang_thai_viet || "Bản nháp",
      yeu_to_nhay_cam: data.yeu_to_nhay_cam || 0,
      link_nguon: data.link_nguon || null, // Truyền link_nguon
      muc_tieu: data.muc_tieu || null, // Truyền muc_tieu
      doi_tuong_doc_gia: data.doi_tuong_doc_gia || null, // Truyền doi_tuong_doc_gia
      thoi_gian_cap_nhat: now,
      anh_bia,
      trang_thai_kiem_duyet,
      user_id,
      ghi_chu_admin: null,
      danh_gia_noi_dung: 0,
      danh_gia_van_phong: 0,
      danh_gia_sang_tao: 0,
    });

    if (Array.isArray(data.theloai_ids) && data.theloai_ids.length > 0) {
      await StoryModel.addGenresForStory(storyId, data.theloai_ids);
    }

    await ChapterModel.createSampleChapter({
      truyen_id: storyId,
      noi_dung: data.chuong_mau,
      thoi_gian_dang: now,
    });

    if (trang_thai_kiem_duyet === "cho_duyet") {
      try {
        await notificationService.sendNotificationToAdmins(
          `Truyện "${data.ten_truyen}" của tác giả ${data.tac_gia} cần được kiểm duyệt.`,
          `/admin/quan-ly-truyen/duyet/${storyId}`
        );
      } catch (notifyErr) {
        console.warn("Failed to send admin notification:", notifyErr);
        // Do not fail the request, just log it
      }
    }

    res.status(201).json({
      message: `Tạo truyện thành công! Truyện đang '${trang_thai_kiem_duyet}'.`,
      storyId,
      trang_thai_kiem_duyet: trang_thai_kiem_duyet,
    });
  } catch (err) {
    console.error("Lỗi khi upload truyện:", err);
    res.status(500).json({
      message: "Lỗi khi upload truyện",
      error: err.message,
    });
  }
};

module.exports = { uploadStory };
