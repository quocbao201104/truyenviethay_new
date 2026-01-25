const db = require("../config/db");

const UserLevelHistory = {
  getByUserId: async (userId) => {
    const [rows] = await db.query(
      "SELECT * FROM user_levels_history WHERE user_id = ? ORDER BY start_date DESC",
      [userId]
    );
    return rows;
  },

  create: async (data) => {
    const { user_id, level_id, start_date, end_date } = data;
    const [result] = await db.query(
      "INSERT INTO user_levels_history (user_id, level_id, start_date, end_date) VALUES (?, ?, ?, ?)",
      [user_id, level_id, start_date, end_date]
    );
    return result.insertId;
  },
  getCurrentLevelOfUser: async (userId) => {
    const [rows] = await db.execute(
      `SELECT level_id 
       FROM user_levels_history 
       WHERE user_id = ? 
       ORDER BY start_date DESC 
       LIMIT 1`,
      [userId]
    );
    return rows[0] ? rows[0].level_id : null;
  },
};

module.exports = UserLevelHistory;
