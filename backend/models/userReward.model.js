const db = require("../config/db");

const UserReward = {
  getByUserId: async (userId) => {
    const [rows] = await db.query(
      "SELECT ur.*, r.name FROM user_rewards ur JOIN rewards r ON ur.reward_id = r.reward_id WHERE ur.user_id = ?",
      [userId]
    );
    return rows;
  },

  claim: async ({ user_id, reward_id }) => {
    const [rows] = await db.query(
      "INSERT INTO user_rewards (user_id, reward_id, claimed_at) VALUES (?, ?, NOW())",
      [user_id, reward_id]
    );
    return rows.insertId;
  },
};

module.exports = UserReward;
