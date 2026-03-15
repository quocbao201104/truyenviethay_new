-- =============================================================================
-- Migration: Extend truyen_new for Author System
-- =============================================================================

ALTER TABLE truyen_new
  ADD COLUMN author_id INT AFTER user_id,
  ADD COLUMN is_hot TINYINT(1) DEFAULT 0,
  ADD COLUMN last_chapter_id INT,
  ADD COLUMN is_deleted TINYINT(1) DEFAULT 0;

ALTER TABLE truyen_new
  ADD CONSTRAINT fk_story_author
  FOREIGN KEY (author_id) REFERENCES authors(id);

CREATE INDEX idx_truyen_author_id ON truyen_new(author_id);
CREATE INDEX idx_truyen_is_deleted ON truyen_new(is_deleted);
