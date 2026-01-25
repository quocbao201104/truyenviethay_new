const db = require("../config/db");

const UserLevel = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM user_levels");
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM user_levels WHERE level_id = ?",
      [id]
    );
    return rows[0];
  },
};

module.exports = UserLevel;
