// backend/middleware/upload_avatar.js
const multer = require('multer');
const path = require('path');

// Cấu hình storage cho multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads_img/avatar/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Lọc file (chỉ cho phép jpg/png)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ hỗ trợ JPG/PNG'), false);
  }
};

// Cấu hình multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    fields: 10, // Số lượng text fields tối đa
    files: 1, // Số lượng file tối đa
  },
}).fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'full_name', maxCount: 1 },
  { name: 'email', maxCount: 1 },
  { name: 'phone', maxCount: 1 },
  { name: 'gender', maxCount: 1 },
]);

module.exports = upload;