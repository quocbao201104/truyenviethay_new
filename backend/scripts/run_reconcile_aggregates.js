/**
 * Chạy reconcile aggregates thủ công (Phase 5)
 * Usage: node scripts/run_reconcile_aggregates.js
 */
require("dotenv").config();
const { runReconcile } = require("../jobs/reconcileAggregatesCronjob");

runReconcile()
  .then(() => {
    console.log("Reconcile done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
