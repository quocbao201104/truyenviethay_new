-- Migration 22: Mở rộng soft delete comments (Phase 3)
-- Thêm deleted_at, deleted_by, delete_reason cho moderation chuẩn

ALTER TABLE comments ADD COLUMN deleted_at DATETIME NULL;
ALTER TABLE comments ADD COLUMN deleted_by INT UNSIGNED NULL;
ALTER TABLE comments ADD COLUMN delete_reason VARCHAR(255) NULL;
