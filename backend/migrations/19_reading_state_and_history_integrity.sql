-- Phase 1: Reading State + History Integrity
-- 1. Create reading_state table (canonical last-read per user, story)
-- 2. Dedupe lich_su_doc_new then add unique constraint
-- 3. Backfill reading_state from lich_su_doc_new

-- Step 1: Create reading_state
CREATE TABLE IF NOT EXISTS reading_state (
  user_id INT NOT NULL,
  truyen_id INT NOT NULL,
  last_read_chuong_id INT NOT NULL,
  last_read_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, truyen_id),
  INDEX idx_reading_state_user (user_id),
  INDEX idx_reading_state_truyen (truyen_id),
  CONSTRAINT fk_reading_state_user FOREIGN KEY (user_id) REFERENCES users_new(id) ON DELETE CASCADE,
  CONSTRAINT fk_reading_state_truyen FOREIGN KEY (truyen_id) REFERENCES truyen_new(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Step 2: Dedupe lich_su_doc_new - keep latest per (user_id, truyen_id, chuong_id)
DELETE lsd1 FROM lich_su_doc_new lsd1
INNER JOIN lich_su_doc_new lsd2
  ON lsd1.user_id = lsd2.user_id
  AND lsd1.truyen_id = lsd2.truyen_id
  AND lsd1.chuong_id = lsd2.chuong_id
  AND (
    lsd1.thoi_gian_doc < lsd2.thoi_gian_doc
    OR (lsd1.thoi_gian_doc = lsd2.thoi_gian_doc AND lsd1.id < lsd2.id)
  );

-- Step 3: Add unique constraint for concurrency-safe UPSERT
ALTER TABLE lich_su_doc_new
ADD UNIQUE INDEX uk_lich_su_doc_user_truyen_chuong (user_id, truyen_id, chuong_id);

-- Step 4: Backfill reading_state from lich_su_doc_new (latest per user, truyen)
-- Chỉ insert khi user_id, truyen_id tồn tại (tránh FK fail với orphan refs)
INSERT INTO reading_state (user_id, truyen_id, last_read_chuong_id, last_read_at)
SELECT
  lsd.user_id,
  lsd.truyen_id,
  CAST(SUBSTRING_INDEX(GROUP_CONCAT(lsd.chuong_id ORDER BY lsd.thoi_gian_doc DESC, lsd.id DESC), ',', 1) AS UNSIGNED) AS last_read_chuong_id,
  MAX(lsd.thoi_gian_doc) AS last_read_at
FROM lich_su_doc_new lsd
INNER JOIN users_new u ON lsd.user_id = u.id
INNER JOIN truyen_new t ON lsd.truyen_id = t.id
GROUP BY lsd.user_id, lsd.truyen_id
ON DUPLICATE KEY UPDATE
  last_read_chuong_id = VALUES(last_read_chuong_id),
  last_read_at = VALUES(last_read_at);
