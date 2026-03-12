const db = require("../config/db");

const ChatMessageModel = {
  create: async (message, connection) => {
    const conn = connection || db;
    const [result] = await conn.query(
      `INSERT INTO chat_messages
       (room_type, room_id, user_id, content, style_snapshot, is_megaphone, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        message.room_type,
        message.room_id,
        message.user_id,
        message.content,
        message.style_snapshot || null,
        message.is_megaphone ? 1 : 0,
      ]
    );
    return result.insertId;
  },

  /**
   * Get latest messages for a room (world or author)
   */
  getRecentByRoom: async (room_type, room_id, limit = 50) => {
    const [rows] = await db.query(
      `SELECT id, room_type, room_id, user_id, content, style_snapshot, is_megaphone, created_at
       FROM chat_messages
       WHERE room_type = ? AND room_id = ?
       ORDER BY id DESC
       LIMIT ?`,
      [room_type, room_id, limit]
    );
    return rows;
  },
};

module.exports = ChatMessageModel;

