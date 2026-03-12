-- =====================================================
-- Migration: Phase 4 - Task Event Deduplication
-- Date: 2026-03-13
-- Goal: Track event-driven task progress so we only increment once per event source.
-- =====================================================

CREATE TABLE IF NOT EXISTS task_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  task_id INT UNSIGNED NOT NULL,
  user_task_id BIGINT UNSIGNED NULL,
  event_type VARCHAR(64) NOT NULL,
  event_ref VARCHAR(128) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY idx_task_event_unique (user_id, task_id, event_type, event_ref),
  CONSTRAINT fk_task_events_user_tasks FOREIGN KEY (user_task_id) REFERENCES user_tasks(id) ON DELETE SET NULL
);

CREATE INDEX idx_task_events_user_task ON task_events(user_id, task_id, user_task_id);

-- =====================================================
-- Verification
-- =====================================================
-- SHOW TABLE STATUS LIKE 'task_events';
-- SHOW INDEX FROM task_events;
