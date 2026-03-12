START TRANSACTION;

SET SQL_SAFE_UPDATES = 0;

-- 1) Backfill period_key
UPDATE user_tasks ut
JOIN tasks t ON t.task_id = ut.task_id
SET ut.period_key = CASE
  WHEN t.repeat_type = 'once' THEN 'once'
  WHEN t.repeat_type = 'daily' THEN DATE_FORMAT(ut.assigned_at, '%Y-%m-%d')
  WHEN t.repeat_type = 'weekly' THEN CONCAT(YEAR(ut.assigned_at), '-W', LPAD(WEEK(ut.assigned_at, 3), 2, '0'))
  WHEN t.repeat_type = 'monthly' THEN DATE_FORMAT(ut.assigned_at, '%Y-%m')
  ELSE NULL
END
WHERE ut.period_key IS NULL
AND ut.id > 0;

-- 2) Deduplicate rows
DELETE ut_old
FROM user_tasks ut_old
JOIN user_tasks ut_newer
  ON ut_old.user_id = ut_newer.user_id
 AND ut_old.task_id = ut_newer.task_id
 AND ut_old.period_key = ut_newer.period_key
 AND ut_old.period_key IS NOT NULL
 AND ut_old.id < ut_newer.id;

-- 3) Create new unique index
CREATE UNIQUE INDEX idx_user_task_period_unique
ON user_tasks(user_id, task_id, period_key);

SET SQL_SAFE_UPDATES = 1;

COMMIT;