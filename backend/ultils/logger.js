const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize } = format;
const path = require("path");
const fs = require("fs");

// Lấy cấu hình từ .env, nếu không có thì dùng giá trị mặc định
const logDir = process.env.LOG_DIR || "logs"; // Mặc định là 'logs'
const logLevel = process.env.LOG_LEVEL || "info"; // Mặc định mức độ log là 'info'

// Tạo thư mục logs nếu chưa có
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Format log: [Thời gian] Mức độ: Nội dung
const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

const logger = createLogger({
  level: logLevel, // Mức độ log được lấy từ .env (hoặc mặc định là 'info')
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [
    new transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error", // Chỉ log lỗi vào file này
    }),
    new transports.File({
      filename: path.join(logDir, "combined.log"), // Log tất cả vào file này
    }),
  ],
});

// Nếu ở môi trường dev thì log ra console với màu sắc
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: combine(colorize(), timestamp({ format: "HH:mm:ss" }), logFormat),
    })
  );
}

module.exports = logger;
