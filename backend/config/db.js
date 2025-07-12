const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Kết nối DB thất bại: ", err);
  } else {
    console.log("Kết nối DB thành công!");
  }
});

module.exports = db.promise(); // <-- BẮT BUỘC khi dùng await!
