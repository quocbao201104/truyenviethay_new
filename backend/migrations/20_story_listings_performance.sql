-- Phase 3: Story Listings Performance
-- 1. FULLTEXT nếu chưa có (migration 03 có thể đã thêm với ngram)
-- 2. Composite index cho hot list

-- Step 1: FULLTEXT (không dùng ngram để tương thích rộng; nếu 03 đã chạy → ER_DUP_KEYNAME, bỏ qua)
ALTER TABLE truyen_new ADD FULLTEXT INDEX idx_fulltext_search (ten_truyen, tac_gia);

-- Step 2: Index cho hot list (ORDER BY hot_score DESC)
CREATE INDEX idx_truyen_status_hot ON truyen_new(trang_thai_kiem_duyet, hot_score);
