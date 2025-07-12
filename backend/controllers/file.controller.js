const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const FileModel = require("../models/file.model");

// Cấu hình
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ["pdf", "docx", "txt"];

exports.uploadFile = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { truyen_id } = req.body;

    // Kiểm tra dữ liệu
    if (!req.file || !truyen_id) {
      return res.status(400).json({ message: "Thiếu file hoặc truyện ID" });
    }

    const file = req.file;
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");

    // Kiểm tra định dạng file
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return res.status(400).json({ message: "Định dạng không hỗ trợ" });
    }

    // Kiểm tra kích thước
    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ message: "File vượt quá 5MB" });
    }

    // Kiểm tra quyền truyện
    const isOwner = await FileModel.isOwnerOfStory({ truyen_id, user_id });
    if (!isOwner) {
      return res
        .status(403)
        .json({ message: "Không có quyền upload truyện này" });
    }

    // Lưu file vật lý
    const filename = `${user_id}_${truyen_id}_${Date.now()}.${ext}`;
    const uploadPath = path.join(__dirname, "../public/uploads_file", filename);

    fs.renameSync(file.path, uploadPath);

    // Lưu DB - bảng files
    const file_id = await FileModel.saveFile({
      truyen_id,
      user_id,
      file_path: `/uploads_file/${filename}`,
      format: ext,
    });

    // Trích xuất nội dung
    let content = "";
    const fileBuffer = fs.readFileSync(uploadPath);

    if (ext === "pdf") {
      const pdf = await pdfParse(fileBuffer);
      content = pdf.text;
    } else if (ext === "docx") {
      const result = await mammoth.extractRawText({ path: uploadPath });
      content = result.value;
    } else if (ext === "txt") {
      content = fileBuffer.toString("utf8");
    }

    content = content.trim();
    if (!content) {
      return res.status(200).json({
        message: "File không chứa nội dung văn bản",
        file_id,
      });
    }

    // Lưu DB - bảng file_contents
    await FileModel.saveFileContent({
      file_id,
      truyen_id,
      user_id,
      noi_dung_txt: content,
    });

    res.status(201).json({
      message: "Tải file và trích xuất nội dung thành công",
      file_id,
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
