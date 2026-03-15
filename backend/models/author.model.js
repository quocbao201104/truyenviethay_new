const db = require("../config/db");
const { getOrSet } = require("../utils/cache");

const TOP_AUTHORS_CACHE_TTL = 1800; // 30 minutes
const TOP_AUTHORS_CACHE_PREFIX = "rank:authors";

const AuthorModel = {
  getById: async (authorId) => {
    const [rows] = await db.query(
      `SELECT 
         a.*,
         u.username,
         u.full_name,
         u.avatar AS user_avatar
       FROM authors a
       LEFT JOIN users_new u ON a.user_id = u.id
       WHERE a.id = ?`,
      [authorId]
    );
    return rows[0];
  },

  getByUserId: async (userId) => {
    const [rows] = await db.query(
      `SELECT * FROM authors WHERE user_id = ?`,
      [userId]
    );
    return rows[0];
  },

  getTopAuthors: async (type = "monthly", limit = 20) => {
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const columnMap = {
      weekly: "weekly_score",
      monthly: "monthly_score",
      potential: "potential_score",
      all: "author_score",
    };
    const normalizedType = columnMap[type] ? type : "monthly";
    const sortCol = columnMap[normalizedType];
    const cacheKey = `${TOP_AUTHORS_CACHE_PREFIX}:${normalizedType}:${safeLimit}`;

    const rows = await getOrSet(cacheKey, TOP_AUTHORS_CACHE_TTL, async () => {
      const [r] = await db.query(
        `SELECT 
           a.*,
           u.username,
           u.full_name,
           u.avatar AS user_avatar
         FROM authors a
         LEFT JOIN users_new u ON a.user_id = u.id
         ORDER BY a.${sortCol} DESC
         LIMIT ?`,
        [safeLimit]
      );
      return r;
    });

    return rows;
  },

  updateProfile: async (authorId, { pen_name, bio }) => {
    const updates = [];
    const params = [];

    if (pen_name !== undefined) {
      const trimmed = typeof pen_name === "string" ? pen_name.trim() : "";
      if (!trimmed) {
        throw new Error("pen_name khÃ´ng há»£p lá»‡");
      }
      updates.push("pen_name = ?");
      params.push(trimmed);
    }

    if (bio !== undefined) {
      updates.push("bio = ?");
      params.push(bio);
    }

    if (updates.length === 0) return 0;

    params.push(authorId);
    const [result] = await db.query(
      `UPDATE authors SET ${updates.join(", ")} WHERE id = ?`,
      params
    );
    return result.affectedRows;
  },
};

module.exports = AuthorModel;
