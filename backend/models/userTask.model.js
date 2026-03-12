const db = require("../config/db");

const Task = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM tasks");
    return rows;
  },

  getTaskById: async (taskId) => {
    const [rows] = await db.execute("SELECT * FROM tasks WHERE task_id = ?", [taskId]);
    return rows[0] || null;
  },

  assign: async (userId, taskId, options = {}) => {
    const {
      status = "pending",
      periodKey = "once",
      progressCurrent = 0,
      progressTarget = 1,
    } = options;

    let existingQuery = "";
    let existingParams = [];

    if (periodKey === null || periodKey === undefined) {
      existingQuery = "SELECT id FROM user_tasks WHERE user_id = ? AND task_id = ? AND period_key IS NULL";
      existingParams = [userId, taskId];
    } else {
      existingQuery = "SELECT id FROM user_tasks WHERE user_id = ? AND task_id = ? AND period_key = ?";
      existingParams = [userId, taskId, periodKey];
    }

    const [existing] = await db.execute(existingQuery, existingParams);

    if (existing.length > 0) {
      const [result] = await db.execute(
        `UPDATE user_tasks
         SET status = ?,
             period_key = ?,
             progress_current = ?,
             progress_target = ?,
             assigned_at = NOW(),
             completed_at = NULL,
             claimed_at = NULL,
             source_event = NULL,
             source_ref = NULL
         WHERE id = ?`,
        [status, periodKey, progressCurrent, progressTarget, existing[0].id]
      );
      return result.affectedRows;
    }

    const [rows] = await db.execute(
      `INSERT INTO user_tasks
         (user_id, task_id, period_key, status, progress_current, progress_target, assigned_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, taskId, periodKey, status, progressCurrent, progressTarget]
    );
    return rows.insertId;
  },

  getTasksByLevel: async (levelId, userId) => {
    const sql = `
      SELECT
        t.*,
        (
          SELECT ut.id
          FROM user_tasks ut
          WHERE ut.user_id = ?
            AND ut.task_id = t.task_id
          ORDER BY ut.assigned_at DESC, ut.id DESC
          LIMIT 1
        ) AS user_task_id,
        (
          SELECT ut.status
          FROM user_tasks ut
          WHERE ut.user_id = ?
            AND ut.task_id = t.task_id
          ORDER BY ut.assigned_at DESC, ut.id DESC
          LIMIT 1
        ) AS status,
        (
          SELECT ut.period_key
          FROM user_tasks ut
          WHERE ut.user_id = ?
            AND ut.task_id = t.task_id
          ORDER BY ut.assigned_at DESC, ut.id DESC
          LIMIT 1
        ) AS period_key,
        COALESCE((
          SELECT ut.progress_current
          FROM user_tasks ut
          WHERE ut.user_id = ?
            AND ut.task_id = t.task_id
          ORDER BY ut.assigned_at DESC, ut.id DESC
          LIMIT 1
        ), 0) AS progress_current,
        COALESCE((
          SELECT ut.progress_target
          FROM user_tasks ut
          WHERE ut.user_id = ?
            AND ut.task_id = t.task_id
          ORDER BY ut.assigned_at DESC, ut.id DESC
          LIMIT 1
        ), 1) AS progress_target,
        (
          SELECT ut.assigned_at
          FROM user_tasks ut
          WHERE ut.user_id = ?
            AND ut.task_id = t.task_id
          ORDER BY ut.assigned_at DESC, ut.id DESC
          LIMIT 1
        ) AS assigned_at,
        (
          SELECT ut.completed_at
          FROM user_tasks ut
          WHERE ut.user_id = ?
            AND ut.task_id = t.task_id
          ORDER BY ut.assigned_at DESC, ut.id DESC
          LIMIT 1
        ) AS completed_at,
        (
          SELECT ut.claimed_at
          FROM user_tasks ut
          WHERE ut.user_id = ?
            AND ut.task_id = t.task_id
          ORDER BY ut.assigned_at DESC, ut.id DESC
          LIMIT 1
        ) AS claimed_at
      FROM tasks t
      WHERE (t.level_id = ? OR t.level_id IS NULL)
      ORDER BY
        CASE
          WHEN status = 'completed' THEN 0
          WHEN status = 'in_progress' THEN 1
          WHEN status = 'pending' OR status IS NULL THEN 2
          WHEN status = 'claimed' THEN 3
          ELSE 4
        END,
        t.task_id ASC
    `;

    const [rows] = await db.execute(sql, [userId, userId, userId, userId, userId, userId, userId, userId, levelId]);
    return rows;
  },
};

module.exports = Task;
