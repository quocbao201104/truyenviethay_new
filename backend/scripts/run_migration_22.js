/**
 * Run migration 22: comments soft delete extended
 * Usage: node scripts/run_migration_22.js
 */
const fs = require("fs");
const path = require("path");
const db = require("../config/db");

const MIGRATION = path.join(__dirname, "../migrations/22_comments_soft_delete_extended.sql");

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
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log("  Skipped (column already exists)");
      } else {
        console.error("  FAILED:", err.message);
        throw err;
      }
    }
  }
  console.log("Migration 22 done.");
}

run()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
