const db = require("../config/db");

async function clearCovers() {
  console.log("=== Bắt đầu dọn dẹp ảnh bìa truyện (Raw SQL) ===");
  try {
    const [result] = await db.query("UPDATE truyen_new SET anh_bia = NULL");
    console.log(`Đã xóa ảnh bìa của ${result.affectedRows} truyện.`);
    console.log("=== Hoàn tất ===");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi khi thực thi:", error);
    process.exit(1);
  }
}

clearCovers();
