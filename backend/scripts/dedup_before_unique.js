/**
 * Script dọn duplicate trước khi chạy migration 21 (unique constraints).
 * Chạy: node scripts/dedup_before_unique.js
 *
 * Logic:
 * - ratings: giữ bản ghi mới nhất (updated_at/created_at) cho mỗi (user_id, truyen_id)
 * - theo_doi: giữ bản ghi mới nhất (ngay_theo_doi) cho mỗi (user_id, truyen_id)
 */
const db = require("../config/db");

async function dedupRatings() {
  const [dups] = await db.query(
    `SELECT user_id, truyen_id, COUNT(*) as cnt
     FROM ratings
     GROUP BY user_id, truyen_id
     HAVING cnt > 1`
  );
  if (dups.length === 0) {
    console.log("[ratings] Không có duplicate.");
    return 0;
  }
  const [r] = await db.query(
    `DELETE r1 FROM ratings r1
     INNER JOIN ratings r2
       ON r1.user_id = r2.user_id AND r1.truyen_id = r2.truyen_id
       AND COALESCE(r1.updated_at, r1.created_at) < COALESCE(r2.updated_at, r2.created_at)`
  );
  console.log(`[ratings] Đã xóa ${r.affectedRows} bản ghi duplicate.`);
  return r.affectedRows;
}

async function dedupTheoDoi() {
  const [dups] = await db.query(
    `SELECT user_id, truyen_id, COUNT(*) as cnt
     FROM theo_doi
     GROUP BY user_id, truyen_id
     HAVING cnt > 1`
  );
  if (dups.length === 0) {
    console.log("[theo_doi] Không có duplicate.");
    return 0;
  }
  const [r] = await db.query(
    `DELETE t1 FROM theo_doi t1
     INNER JOIN theo_doi t2
       ON t1.user_id = t2.user_id AND t1.truyen_id = t2.truyen_id
       AND t1.ngay_theo_doi < t2.ngay_theo_doi`
  );
  console.log(`[theo_doi] Đã xóa ${r.affectedRows} bản ghi duplicate.`);
  return r.affectedRows;
}

async function run() {
  console.log("=== Dedup trước khi add unique constraints ===\n");
  await dedupRatings();
  await dedupTheoDoi();
  console.log("\nDone. Tiếp theo chạy: node scripts/run_migration_21.js");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
