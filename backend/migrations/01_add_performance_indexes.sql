-- Migration: Add missing indexes for performance optimization
-- Target: truyen_new table

-- 1. Index for slug lookups (Critical for StoryDetailView)
CREATE INDEX IF NOT EXISTS idx_slug ON truyen_new(slug);

-- 2. Index for filtering by approval status (Critical for Public Stories query)
CREATE INDEX IF NOT EXISTS idx_status ON truyen_new(trang_thai_kiem_duyet);

-- 3. Index for filtering by author (Critical for Profile/Admin views)
CREATE INDEX IF NOT EXISTS idx_user_id ON truyen_new(user_id);

-- 4. Composite index for filtering stories by status and update time (Optimization for homepage sorting)
CREATE INDEX IF NOT EXISTS idx_status_updated ON truyen_new(trang_thai_kiem_duyet, thoi_gian_cap_nhat DESC);
