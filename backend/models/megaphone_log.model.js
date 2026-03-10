const db = require("../config/db");

const MegaphoneLogModel = {
  create: async (logData, connection) => {
    const conn = connection || db;
    const [result] = await conn.execute(
      "INSERT INTO megaphone_logs (user_id, message, cost, item_used) VALUES (?, ?, ?, ?)",
      [logData.user_id, logData.message, logData.cost, logData.item_used || 'truyen_am_phu']
    );
    return result.insertId;
  },

  getRecent: async (limit = 20) => {
    const [rows] = await db.query(
      `SELECT ml.id, ml.user_id, ml.message, ml.cost, ml.item_used, ml.created_at, u.username, u.avatar 
       FROM megaphone_logs ml
       JOIN users_new u ON ml.user_id = u.id
       ORDER BY ml.created_at DESC LIMIT ?`,
      [limit]
    );
    return rows;
  }
};

module.exports = MegaphoneLogModel;
