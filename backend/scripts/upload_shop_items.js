/**
 * backend/scripts/upload_shop_items.js
 * 
 * Script to upload specific shop item images to Cloudinary 
 * and update the shop_items table for IDs 6, 7, and 8.
 * 
 * Usage:
 *   cd backend
 *   node scripts/upload_shop_items.js
 */

require("dotenv").config();
const path = require("path");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");
const db = require("../config/db");

const IMAGES_DIR = path.resolve(__dirname, "../../frontend/src/assets/images/avatar_frame");
const CLOUDINARY_FOLDER = "truyenviethay/shop_items";

// Mapping of filename to Database ID
const MAPPING = [
  { id: 6, filename: "cuu-vy-rmbg.png" },
  { id: 7, filename: "phuong-hoang-rmbg.png" },
  { id: 8, filename: "dan-duoc.jpg" }
];

async function uploadFile(filePath, publicId) {
  return cloudinary.uploader.upload(filePath, {
    folder: CLOUDINARY_FOLDER,
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
  });
}

(async () => {
  try {
    console.log("🚀 Starting shop items image upload process...\n");

    for (const item of MAPPING) {
      const filePath = path.join(IMAGES_DIR, item.filename);

      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found, skipping ID ${item.id}: ${item.filename}`);
        continue;
      }

      console.log(`📤 Uploading ID ${item.id}: ${item.filename}...`);
      
      // Use filename without extension as part of public_id
      const publicId = path.parse(item.filename).name;
      const result = await uploadFile(filePath, `shop_item_${item.id}_${publicId}`);

      console.log(`   ✓ Uploaded to Cloudinary: ${result.secure_url}`);

      console.log(`   🔄 Updating Database ID ${item.id}...`);
      const [dbResult] = await db.query(
        "UPDATE shop_items SET image_url = ? WHERE id = ?",
        [result.secure_url, item.id]
      );

      if (dbResult.affectedRows > 0) {
        console.log(`   ✅ Database updated successfully!`);
      } else {
        console.warn(`   ⚠️  No rows updated in database (check if ID ${item.id} exists).`);
      }
      console.log("");
    }

    console.log("✨ All tasks completed!");
  } catch (err) {
    console.error("❌ Process failed:", err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
