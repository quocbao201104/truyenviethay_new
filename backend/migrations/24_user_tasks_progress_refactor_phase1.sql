-- =====================================================
-- Migration: Phase 1 - user_tasks progress model (compat)
-- Date: 2026-03-12
-- Goal:
--   - Extend user_tasks for progress/claim-based tasks
--   - Keep old pending/completed flow working during rollout
--   - Prepare for period-based uniqueness in a later phase
-- =====================================================

-- 1) Expand lifecycle status without breaking current code.
ALTER TABLE user_tasks
MODIFY COLUMN status ENUM('pending', 'in_progress', 'completed', 'claimed', 'expired')
NOT NULL DEFAULT 'pending';

-- 2) Add progress and claim fields.
ALTER TABLE user_tasks
ADD COLUMN period_key VARCHAR(32) NULL COMMENT 'Task window key: once / YYYY-MM-DD / YYYY-Www / YYYY-MM' AFTER task_id,
ADD COLUMN progress_current INT UNSIGNED NOT NULL DEFAULT 0 AFTER status,
ADD COLUMN progress_target INT UNSIGNED NOT NULL DEFAULT 1 AFTER progress_current,
ADD COLUMN claimed_at DATETIME NULL AFTER completed_at,
ADD COLUMN source_event VARCHAR(64) NULL AFTER claimed_at,
ADD COLUMN source_ref VARCHAR(128) NULL AFTER source_event,
ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ON UPDATE CURRENT_TIMESTAMP AFTER source_ref;

-- 3) Backfill progress for existing rows.
UPDATE user_tasks
SET progress_target = 1,
    progress_current = CASE
      WHEN status IN ('completed', 'claimed') THEN 1
      ELSE 0
    END
WHERE progress_target = 1
  AND progress_current = 0;

-- 4) Backfill period_key from tasks.repeat_type.
--    This is only preparatory for the next phase; current code still uses assigned_at.
UPDATE user_tasks ut
JOIN tasks t ON t.task_id = ut.task_id
SET ut.period_key = CASE
  WHEN t.repeat_type = 'once' THEN 'once'
  WHEN t.repeat_type = 'daily' THEN DATE_FORMAT(ut.assigned_at, '%Y-%m-%d')
  WHEN t.repeat_type = 'weekly' THEN CONCAT(YEAR(ut.assigned_at), '-W', LPAD(WEEK(ut.assigned_at, 3), 2, '0'))
  WHEN t.repeat_type = 'monthly' THEN DATE_FORMAT(ut.assigned_at, '%Y-%m')
  ELSE NULL
END
WHERE ut.period_key IS NULL;

-- 5) Add indexes for the upcoming task engine changes.
CREATE INDEX idx_user_tasks_user_status_period
ON user_tasks(user_id, status, period_key, assigned_at);

CREATE INDEX idx_user_tasks_task_period
ON user_tasks(user_id, task_id, period_key);

CREATE INDEX idx_user_tasks_claimed_at
ON user_tasks(user_id, claimed_at);

-- =====================================================
-- Important rollout note
-- =====================================================
-- Do NOT drop idx_user_task_unique (user_id, task_id) in this phase.
-- Current code still inserts user_tasks without period_key, so dropping the
-- old unique too early could create inconsistent duplicate rows.
--
-- Phase 2 should update the service layer to always write period_key,
-- progress_current, and progress_target on insert/update.
--
-- Phase 3 can then:
--   1. Deduplicate old rows by (user_id, task_id, period_key)
--   2. Drop idx_user_task_unique
--   3. Add UNIQUE(user_id, task_id, period_key)
--
-- Verification
-- =====================================================
-- SHOW COLUMNS FROM user_tasks;
-- SHOW INDEX FROM user_tasks;
-- SELECT id, user_id, task_id, status, period_key, progress_current, progress_target
-- FROM user_tasks
-- ORDER BY id DESC
-- LIMIT 20;
