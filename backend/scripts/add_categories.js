const db = require("../config/db");

async function updateCategories() {
  const categoryToRemove = "Tận Thế";

  console.log(`Starting to remove category '${categoryToRemove}'...`);

  try {
    const [result] = await db.query("DELETE FROM theloai_new WHERE ten_theloai = ?", [categoryToRemove]);
    
    if (result.affectedRows > 0) {
      console.log(`✅ Success: Category '${categoryToRemove}' has been removed.`);
    } else {
      console.log(`⚠️ Category '${categoryToRemove}' not found. No action taken.`);
    }

  } catch (err) {
    console.error("❌ Error removing category:", err);
  } finally {
    process.exit();
  }
}

updateCategories();
