// // middleware/chapter.validator.js
// const { body } = require("express-validator");
// const { handleValidation } = require("../middleware/validate");

// exports.validateCreateChapter = [
//   body("truyen_id")
//     .notEmpty()
//     .withMessage("ID truyện không được để trống")
//     .isInt({ min: 1 })
//     .withMessage("ID truyện phải là số nguyên dương"),

//   body("so_chuong")
//     .notEmpty()
//     .withMessage("Số chương không được để trống")
//     .isInt({ min: 1 })
//     .withMessage("Số chương phải là số nguyên dương"),

//   body("tieu_de")
//     .notEmpty()
//     .withMessage("Tiêu đề chương không được để trống")
//     .isLength({ min: 3 })
//     .withMessage("Tiêu đề phải ít nhất 3 ký tự"),

//   body("noi_dung")
//     .notEmpty()
//     .withMessage("Nội dung chương không được để trống"),

//   handleValidation,
// ];

// exports.validateUpdateChapter = [
//   body("tieu_de")
//     .notEmpty()
//     .withMessage("Tiêu đề chương không được để trống")
//     .isLength({ min: 3 })
//     .withMessage("Tiêu đề chương phải có ít nhất 3 ký tự"),

//   body("noi_dung")
//     .notEmpty()
//     .withMessage("Nội dung chương không được để trống")
//     .isLength({ min: 10 })
//     .withMessage("Nội dung chương phải có ít nhất 10 ký tự"),

//   body("so_chuong")
//     .notEmpty()
//     .withMessage("Số chương không được để trống")
//     .isInt({ min: 1 })
//     .withMessage("Số chương phải là một số nguyên và lớn hơn 0"),
//   handleValidation,
// ];
