-- Migration 31: Add source tracking columns and indexes for crawler sync
-- Safe to run multiple times on MySQL 8 because each change checks information_schema first.

SET @db_name = DATABASE();

SET @add_link_nguon = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db_name
        AND TABLE_NAME = 'chuong'
        AND COLUMN_NAME = 'link_nguon'
    ),
    'SELECT ''skip add chuong.link_nguon''',
    'ALTER TABLE chuong ADD COLUMN link_nguon VARCHAR(500) NULL AFTER content_length'
  )
);
PREPARE stmt FROM @add_link_nguon;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_source_order = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db_name
        AND TABLE_NAME = 'chuong'
        AND COLUMN_NAME = 'source_order'
    ),
    'SELECT ''skip add chuong.source_order''',
    'ALTER TABLE chuong ADD COLUMN source_order INT NULL AFTER link_nguon'
  )
);
PREPARE stmt FROM @add_source_order;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_source_updated_at = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db_name
        AND TABLE_NAME = 'chuong'
        AND COLUMN_NAME = 'source_updated_at'
    ),
    'SELECT ''skip add chuong.source_updated_at''',
    'ALTER TABLE chuong ADD COLUMN source_updated_at DATETIME NULL AFTER source_order'
  )
);
PREPARE stmt FROM @add_source_updated_at;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_idx_source_order = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = @db_name
        AND TABLE_NAME = 'chuong'
        AND INDEX_NAME = 'uk_chuong_story_source_order'
    ),
    'SELECT ''skip add uk_chuong_story_source_order''',
    'ALTER TABLE chuong ADD UNIQUE KEY uk_chuong_story_source_order (truyen_id, source_order)'
  )
);
PREPARE stmt FROM @add_idx_source_order;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_idx_source_link = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = @db_name
        AND TABLE_NAME = 'chuong'
        AND INDEX_NAME = 'uk_chuong_story_source_link'
    ),
    'SELECT ''skip add uk_chuong_story_source_link''',
    'ALTER TABLE chuong ADD UNIQUE KEY uk_chuong_story_source_link (truyen_id, link_nguon(191))'
  )
);
PREPARE stmt FROM @add_idx_source_link;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
