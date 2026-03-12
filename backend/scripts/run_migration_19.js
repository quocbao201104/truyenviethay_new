/**
 * Run migration 19: reading_state table + history integrity
 * Usage: node scripts/run_migration_19.js
 * Requires: .env with DB_* vars
 */
const fs = require("fs");
const path = require("path");
const db = require("../config/db");

const MIGRATION = path.join(__dirname, "../migrations/19_reading_state_and_history_integrity.sql");

async function run() {
  const sql = fs.readFileSync(MIGRATION, "utf8");
  // Strip line comments before split to avoid breaking on ; inside comments
  const sqlNoComments = sql.replace(/--[^\n]*\n/g, "\n");
  const statements = sqlNoComments
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Running ${statements.length} statements from migration 19...`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ";";
    const preview = stmt.substring(0, 80).replace(/\s+/g, " ");
    console.log(`[${i + 1}/${statements.length}] ${preview}...`);
    try {
      await db.query(stmt);
      console.log("  OK");
    } catch (err) {
      if (err.code === "ER_DUP_KEYNAME" || err.code === "ER_DUP_FIELDNAME") {
        console.log("  Skipped (already exists)");
      } else {
        console.error("  FAILED:", err.message);
        throw err;
      }
    }
  }
  console.log("Migration 19 done.");
}

run()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
