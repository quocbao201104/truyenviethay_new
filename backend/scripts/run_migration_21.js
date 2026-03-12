/**
 * Run migration 21: data integrity unique constraints + indexes
 * Chạy sau: node scripts/dedup_before_unique.js
 * Usage: node scripts/run_migration_21.js
 */
const fs = require("fs");
const path = require("path");
const db = require("../config/db");

const MIGRATION = path.join(__dirname, "../migrations/21_data_integrity_unique_indexes.sql");

async function run() {
  const sql = fs.readFileSync(MIGRATION, "utf8");
  const sqlNoComments = sql
    .replace(/--[^\n]*\n/g, "\n")
    .replace(/\n{2,}/g, "\n");
  const statements = sqlNoComments
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ";";
    const preview = stmt.substring(0, 80).replace(/\s+/g, " ");
    console.log(`[${i + 1}/${statements.length}] ${preview}...`);
    try {
      await db.query(stmt);
      console.log("  OK");
    } catch (err) {
      if (err.code === "ER_DUP_KEYNAME" || err.code === "ER_DUP_INDEX") {
        console.log("  Skipped (index already exists)");
      } else {
        console.error("  FAILED:", err.message);
        throw err;
      }
    }
  }
  console.log("Migration 21 done.");
}

run()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
