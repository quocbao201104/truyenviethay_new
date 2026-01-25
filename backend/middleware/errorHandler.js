const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  // Ghi log lỗi
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);

  // Trả về lỗi cho client
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lỗi server!",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;
