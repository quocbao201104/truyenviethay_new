// const { body } = require("express-validator");
// const { handleValidation } = require("../middleware/validate");

// exports.validateUpStory = [
//   body("title").notEmpty().withMessage("Tiêu đề truyện không được để trống"),
//   body("author_name").notEmpty().withMessage("Tên tác giả không được để trống"),
//   body("description")
//     .notEmpty()
//     .withMessage("Mô tả truyện không được để trống"),
//   body("chuong_mau").notEmpty().withMessage("Chương mẫu không được để trống"),
//   handleValidation,
// ];

// exports.validateUpdateStory = [
//   body("ten_truyen").notEmpty().withMessage("Tên truyện không được để trống"),
//   body("tac_gia").notEmpty().withMessage("Tác giả không được để trống"),
//   body("mo_ta").notEmpty().isLength({ min: 10 }).withMessage("Mô tả quá ngắn"),
//   body("trang_thai")
//     .isIn(["public", "private"])
//     .withMessage("Trạng thái không hợp lệ"),
//   body("anh_bia").optional().isString(),
//   handleValidation,
// ];
