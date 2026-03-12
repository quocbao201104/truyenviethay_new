const { body, validationResult } = require("express-validator");

const MAX_QUANTITY = 999;

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu đầu vào không hợp lệ.",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

const validateBuyItem = [
  body("itemId")
    .exists()
    .withMessage("itemId không được để trống.")
    .isInt({ min: 1 })
    .withMessage("itemId phải là số nguyên dương."),
  body("quantity")
    .optional({ values: "null" })
    .default(1)
    .isInt({ min: 1, max: MAX_QUANTITY })
    .withMessage(`quantity phải từ 1 đến ${MAX_QUANTITY}.`),
  handleValidationErrors,
];

module.exports = {
  validateBuyItem,
  MAX_QUANTITY,
};
