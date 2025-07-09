// middleware/upload_image.js
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "public/uploads_img/";

    // Tùy theo field name để phân loại nơi lưu
    if (file.fieldname === "avatar") {
      uploadPath += "avatar";
    } else if (file.fieldname === "bia_truyen") {
      uploadPath += "bia_truyen";
    } else {
      uploadPath += "others"; // fallback
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${file.fieldname}_${Date.now()}${ext}`;
    cb(null, name);
  },
});

// Tùy chọn lọc file nếu cần
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép ảnh jpg, jpeg, png"));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
