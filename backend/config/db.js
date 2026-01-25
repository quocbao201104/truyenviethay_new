const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 50, // Fail fast if > 50 requests are waiting
  acquireTimeout: 5000, // Error if obtaining connection takes > 5s
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: {
    rejectUnauthorized: false // Bắt buộc cho Aiven
  },
  timezone: '+07:00' // Sử dụng múi giờ Việt Nam
});

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Kết nối DB thất bại: ", err);
    return;
  }
  console.log("✅ Kết nối DB Aiven thành công!");
  connection.release();
});

module.exports = pool.promise();