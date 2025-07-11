// backend/middleware/upload_avatar.js
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import fs để đảm bảo thư mục tồn tại

// Đường dẫn lưu trữ avatar: backend/public/uploads_img/avatar/
// __dirname là thư mục hiện tại (middleware), cần lùi 2 cấp để đến thư mục gốc backend
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads_img', 'avatar');

// Đảm bảo thư mục tồn tại
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`Created upload directory: ${UPLOAD_DIR}`); // Log khi tạo thư mục
}

// Cấu hình storage cho multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR); // Sử dụng đường dẫn tuyệt đối cho destination
    },
    filename: (req, file, cb) => {
        // Tạo tên file duy nhất: avatar-userId-timestamp.ext
        // req.user.id cần được gán bởi authenticateToken trước Multer
        const userId = req.user && req.user.id ? req.user.id : 'unknown'; // Fallback nếu userId không có
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${userId}-${uniqueSuffix}${ext}`);
    },
});

// Lọc file (chỉ cho phép jpg/png)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh JPG, JPEG, PNG!'), false); // Từ chối file
    }
};

// Cấu hình multer
// CHUYỂN TỪ .fields() SANG .single('avatar')
const uploadAvatar = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: fileFilter,
});

module.exports = uploadAvatar;