const { body, validationResult } = require("express-validator");

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

const validateCreateRating = [
  body("truyenId")
    .exists()
    .withMessage("truyenId không được để trống.")
    .isInt({ min: 1 })
    .withMessage("truyenId phải là số nguyên dương."),
  body("rating")
    .exists()
    .withMessage("rating không được để trống.")
    .isInt({ min: 1, max: 5 })
    .withMessage("rating phải từ 1 đến 5 sao."),
  handleValidationErrors,
];

module.exports = {
  validateCreateRating,
};
