const db = require("../config/db");

const AuthorFollowModel = {
  isFollowing: async (userId, authorId) => {
    const [rows] = await db.query(
      `SELECT id FROM author_follows WHERE user_id = ? AND author_id = ?`,
      [userId, authorId]
    );
    return rows;
  },

  addFollow: async (userId, authorId) => {
    const [result] = await db.query(
      `INSERT IGNORE INTO author_follows (user_id, author_id) VALUES (?, ?)`,
      [userId, authorId]
    );
    return result;
  },

  removeFollow: async (userId, authorId) => {
    const [result] = await db.query(
      `DELETE FROM author_follows WHERE user_id = ? AND author_id = ?`,
      [userId, authorId]
    );
    return result;
  },

  getFollowedAuthors: async (userId, offset = 0, limit = 20) => {
    const [rows] = await db.query(
      `SELECT 
         a.*,
         u.username,
         u.full_name,
         u.avatar AS user_avatar,
         af.created_at AS followed_at
       FROM author_follows af
       JOIN authors a ON af.author_id = a.id
       LEFT JOIN users_new u ON a.user_id = u.id
       WHERE af.user_id = ?
       ORDER BY af.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return rows;
  },

  getFollowedAuthorsCount: async (userId) => {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total FROM author_follows WHERE user_id = ?`,
      [userId]
    );
    return rows[0]?.total || 0;
  },
};

module.exports = AuthorFollowModel;
