// middleware/upload_image.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'truyenviethay'; // Tên folder trên Cloudinary
    
    if (file.fieldname === 'avatar') {
      folder += '/avatars';
    } else if (file.fieldname === 'bia_truyen' || file.fieldname === 'anh_bia') {
      folder += '/covers';
    } else {
      folder += '/others';
    }
    
    return {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }]
    };
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép ảnh jpg, jpeg, png, webp"));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
