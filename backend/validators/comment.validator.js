const { body, query, param, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ.",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const validateAddComment = [
  body("truyen_id")
    .exists()
    .withMessage("truyen_id không được để trống.")
    .isInt({ min: 1 })
    .withMessage("truyen_id phải là số nguyên dương."),
  body("content")
    .exists()
    .withMessage("Nội dung không được để trống.")
    .trim()
    .notEmpty()
    .withMessage("Nội dung không được để trống.")
    .isLength({ max: 2000 })
    .withMessage("Nội dung tối đa 2000 ký tự."),
  body("parent_id")
    .optional({ values: "null" })
    .isInt({ min: 1 })
    .withMessage("parent_id phải là số nguyên dương."),
  handleValidationErrors,
];

const validateGetComments = [
  query("truyen_id")
    .exists()
    .withMessage("truyen_id không được để trống.")
    .isInt({ min: 1 })
    .withMessage("truyen_id phải là số nguyên dương."),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page phải là số nguyên dương."),
  handleValidationErrors,
];

module.exports = {
  validateAddComment,
  validateGetComments,
};
