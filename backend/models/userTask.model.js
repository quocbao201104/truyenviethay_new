const db = require("../config/db");

const Task = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM tasks");
    return rows;
  },

  assign: async (userId, taskId) => {
    const [rows] = await db.query(
      'INSERT INTO user_tasks (user_id, task_id, status) VALUES (?, ?, "pending")',
      [userId, taskId]
    );
    return rows.insertId;
  },

  complete: async (userId, taskId) => {
    const [rows] = await db.query(
      'UPDATE user_tasks SET status = "completed", completed_at = NOW() WHERE user_id = ? AND task_id = ?',
      [userId, taskId]
    );
    return rows.affectedRows;
  },

  getTaskById: async (taskId) => {
    const [rows] = await db.execute("SELECT * FROM tasks WHERE task_id = ?", [
      taskId,
    ]);
    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  },
};

module.exports = Task;
