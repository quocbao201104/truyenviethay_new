/**
 * Run migration 34: create reports table
 * Usage: node scripts/run_migration_34.js
 */
const fs = require("fs");
const path = require("path");
const db = require("../config/db");

const MIGRATION = path.join(__dirname, "../migrations/34_create_reports.sql");

async function run() {
  const sql = fs.readFileSync(MIGRATION, "utf8");
  const statements = sql
    .replace(/--[^\n]*\n/g, "\n")
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);

  for (let i = 0; i < statements.length; i += 1) {
    const statement = `${statements[i]};`;
    const preview = statement.substring(0, 80).replace(/\s+/g, " ");
    console.log(`[${i + 1}/${statements.length}] ${preview}...`);

    try {
      await db.query(statement);
      console.log("  OK");
    } catch (error) {
      if (
        error.code === "ER_TABLE_EXISTS_ERROR" ||
        error.code === "ER_DUP_KEYNAME" ||
        error.code === "ER_DUP_FIELDNAME" ||
        error.code === "ER_FK_DUP_NAME"
      ) {
        console.log("  Skipped (already exists)");
      } else {
        console.error("  FAILED:", error.message);
        throw error;
      }
    }
  }

  console.log("Migration 34 done.");
}

run()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
