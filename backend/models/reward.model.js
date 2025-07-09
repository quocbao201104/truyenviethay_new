const db = require("../config/db");

const Reward = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM rewards");
    return rows;
  },

  create: async ({ name, required_points, reward_type }) => {
    const [rows] = await db.query(
      "INSERT INTO rewards (name, required_points, reward_type) VALUES (?, ?, ?)",
      [name, required_points, reward_type]
    );
    return rows.insertId;
  },
};

module.exports = Reward;
