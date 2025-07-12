// const { body, param } = require("express-validator");
// const { handleValidation } = require("../middleware/validate");

// // Thêm comment
// exports.validateAddComment = [
//   body("truyen_id")
//     .notEmpty()
//     .withMessage("ID truyện không được để trống")
//     .isInt({ min: 1 })
//     .withMessage("ID truyện phải là số nguyên dương"),

//   body("content")
//     .notEmpty()
//     .withMessage("Nội dung bình luận không được để trống")
//     .isLength({ min: 3 })
//     .withMessage("Nội dung bình luận quá ngắn"),

//   handleValidation,
// ];
