-- Migration 21: Data integrity - unique constraints và indexes
-- Chạy sau khi: node scripts/dedup_before_unique.js
--
-- Mục đích:
-- - ratings: ON DUPLICATE KEY UPDATE cần UNIQUE(user_id, truyen_id)
-- - theo_doi: tránh duplicate follow
-- - Indexes cho query phổ biến

-- 1. ratings: unique (user_id, truyen_id)
ALTER TABLE ratings ADD UNIQUE INDEX uk_ratings_user_truyen (user_id, truyen_id);

-- 2. ratings: index cho truy vấn theo truyen
CREATE INDEX idx_ratings_truyen_created ON ratings(truyen_id, created_at);

-- 3. theo_doi: unique (user_id, truyen_id)
ALTER TABLE theo_doi ADD UNIQUE INDEX uk_theo_doi_user_truyen (user_id, truyen_id);

-- 4. theo_doi: indexes cho follow list
CREATE INDEX idx_theo_doi_user_ngay ON theo_doi(user_id, ngay_theo_doi);
CREATE INDEX idx_theo_doi_truyen ON theo_doi(truyen_id);
