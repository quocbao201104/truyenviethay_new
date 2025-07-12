const logger = require("../ultils/logger");

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
// Đoạn mã này định nghĩa một middleware xử lý lỗi cho ứng dụng Express. Khi có lỗi xảy ra trong quá trình xử lý yêu cầu, middleware này sẽ ghi log lỗi và trả về phản hồi cho client với thông tin về lỗi. Nó cũng kiểm tra môi trường (development hay production) để quyết định có hiển thị stack trace hay không.
