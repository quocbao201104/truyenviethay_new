const { body, query, param, validationResult } = require("express-validator");
const {
  REPORT_TARGET_TYPES,
  REPORT_STATUSES,
  AUTHOR_ALLOWED_STATUSES,
} = require("../constants/report.constants");

const createAllowedTargets = [
  REPORT_TARGET_TYPES.CHAPTER,
  REPORT_TARGET_TYPES.COMMENT,
  REPORT_TARGET_TYPES.NOVEL,
  REPORT_TARGET_TYPES.AUDIO,
];

const allStatuses = Object.values(REPORT_STATUSES);

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Du lieu khong hop le.",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }
  next();
};

const validateCreateReport = [
  body("target_id")
    .isInt({ min: 1 })
    .withMessage("target_id phai la so nguyen duong."),
  body("target_type")
    .isIn(createAllowedTargets)
    .withMessage("target_type khong hop le."),
  body("issue_type")
    .trim()
    .notEmpty()
    .withMessage("issue_type khong duoc de trong."),
  body("description")
    .optional({ values: "falsy" })
    .isLength({ max: 2000 })
    .withMessage("description toi da 2000 ky tu."),
  handleValidationErrors,
];

const validateListReports = [
  query("page").optional().isInt({ min: 1 }).withMessage("page khong hop le."),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit khong hop le."),
  query("status").optional({ values: "falsy" }).isIn(allStatuses).withMessage("status khong hop le."),
  query("target_type")
    .optional({ values: "falsy" })
    .isIn(Object.values(REPORT_TARGET_TYPES))
    .withMessage("target_type khong hop le."),
  handleValidationErrors,
];

const validateReportIdParam = [
  param("id").isInt({ min: 1 }).withMessage("id khong hop le."),
  handleValidationErrors,
];

const validateAdminUpdateReport = [
  param("id").isInt({ min: 1 }).withMessage("id khong hop le."),
  body("status").isIn(allStatuses).withMessage("status khong hop le."),
  body("admin_note")
    .optional({ values: "falsy" })
    .isLength({ max: 5000 })
    .withMessage("admin_note toi da 5000 ky tu."),
  handleValidationErrors,
];

const validateAuthorUpdateReport = [
  param("id").isInt({ min: 1 }).withMessage("id khong hop le."),
  body("status")
    .isIn(AUTHOR_ALLOWED_STATUSES)
    .withMessage("status khong hop le."),
  body("admin_note")
    .optional({ values: "falsy" })
    .isLength({ max: 5000 })
    .withMessage("admin_note toi da 5000 ky tu."),
  handleValidationErrors,
];

module.exports = {
  validateCreateReport,
  validateListReports,
  validateReportIdParam,
  validateAdminUpdateReport,
  validateAuthorUpdateReport,
};
