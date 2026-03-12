const { body, param, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đầu vào không hợp lệ',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Validate task assignment
const validateTaskAssignment = [
  body('task_id')
    .isInt({ min: 1 })
    .withMessage('task_id phải là số nguyên dương'),
  handleValidationErrors,
];

// Validate task completion (body: { task_id })
const validateTaskCompletion = [
  body('task_id')
    .isInt({ min: 1 })
    .withMessage('task_id phải là số nguyên dương'),
  handleValidationErrors,
];

const validateTaskClaim = [
  body('task_id')
    .isInt({ min: 1 })
    .withMessage('task_id phải là số nguyên dương'),
  handleValidationErrors,
];

module.exports = {
  validateTaskAssignment,
  validateTaskCompletion,
  validateTaskClaim,
  handleValidationErrors,
};
