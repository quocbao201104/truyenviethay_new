const db = require("../config/db");

/**
 * Script to clear all story descriptions in the truyen_new table.
 * Sets mo_ta = NULL for all records.
 */
async function clearDescriptions() {
  console.log("Starting to clear all story descriptions...");
  try {
    const [result] = await db.query("UPDATE truyen_new SET mo_ta = NULL");
    console.log(`✅ Success: Cleared descriptions for ${result.affectedRows} stories.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing descriptions:", error);
    process.exit(1);
  }
}

clearDescriptions();
