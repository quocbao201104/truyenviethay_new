// utils/slugify.js
const slugify = require("slugify");

// Hàm tạo slug từ tiêu đề
const generateSlug = (title) => {
  return slugify(title, {
    lower: true, // Chuyển thành chữ thường
    remove: /[*+~.()'"!:@]/g, // Xóa ký tự đặc biệt
  });
};

module.exports = generateSlug;
