// const { body } = require("express-validator");
// const { handleValidation } = require("../middleware/validate");

// exports.validateRegister = [
//   body("username")
//     .notEmpty()
//     .withMessage("Username không được để trống")
//     .isLength({ min: 4, max: 20 })
//     .withMessage("Username phải từ 4 đến 20 ký tự"),

//   body("password")
//     .notEmpty()
//     .withMessage("Password không được để trống")
//     .isLength({ min: 6 })
//     .withMessage("Password phải ít nhất 6 ký tự"),

//   body("email")
//     .notEmpty()
//     .withMessage("Email không được để trống")
//     .isEmail()
//     .withMessage("Email không hợp lệ"),

//   body("full_name")
//     .notEmpty()
//     .withMessage("Họ tên không được để trống")
//     .isLength({ min: 2 })
//     .withMessage("Họ tên quá ngắn"),

//   body("phone")
//     .notEmpty()
//     .withMessage("Số điện thoại không được để trống")
//     .matches(/^(0|\+84)\d{9}$/)
//     .withMessage("Số điện thoại không hợp lệ"),
//   handleValidation,
// ];

// exports.validateLogin = [
//   body("username").notEmpty().withMessage("Username không được để trống"),
//   body("password").notEmpty().withMessage("Mật khẩu không được để trống"),
//   handleValidation,
// ];

// exports.validateUpdateUser = [
//   body("full_name")
//     .optional()
//     .isLength({ min: 2 })
//     .withMessage("Họ tên phải có ít nhất 2 ký tự"),

//   body("email").optional().isEmail().withMessage("Email không hợp lệ"),

//   body("phone")
//     .optional()
//     .matches(/^(0|\+84)\d{9}$/)
//     .withMessage("Số điện thoại không hợp lệ"),

//   body("avatar")
//     .optional()
//     .isURL()
//     .withMessage("Avatar phải là một URL hợp lệ"),
//   handleValidation,
// ];

// exports.validateChangePassword = [
//   body("current_password")
//     .notEmpty()
//     .withMessage("Mật khẩu hiện tại không được để trống"),

//   body("new_password")
//     .notEmpty()
//     .withMessage("Mật khẩu mới không được để trống")
//     .isLength({ min: 6 })
//     .withMessage("Mật khẩu mới phải ít nhất 6 ký tự"),

//   body("confirm_password")
//     .custom((value, { req }) => value === req.body.new_password)
//     .withMessage("Xác nhận mật khẩu không khớp"),

//   handleValidation,
// ];
