/**
 * Run migration 23: create chat_messages table
 * Usage: node scripts/run_migration_23.js
 *
 * Yêu cầu:
 * - Đã cấu hình .env backend (bao gồm REDIS_URL, DB_*)
 */
const fs = require("fs");
const path = require("path");
const db = require("../config/db");

const MIGRATION = path.join(__dirname, "../migrations/23_create_chat_messages.sql");

async function run() {
  const sql = fs.readFileSync(MIGRATION, "utf8");
  const statements = sql
    .replace(/--[^\n]*\n/g, "\n")
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
      if (err.code === "ER_TABLE_EXISTS_ERROR") {
        console.log("  Skipped (table already exists)");
      } else if (err.code === "ER_DUP_KEYNAME" || err.code === "ER_DUP_FIELDNAME") {
        console.log("  Skipped (index/column already exists)");
      } else {
        console.error("  FAILED:", err.message);
        throw err;
      }
    }
  }
  console.log("Migration 23 done.");
}

run()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

