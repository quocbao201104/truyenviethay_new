const db = require("../config/db");

const ChatRoomModel = {
  // Get all chat rooms
  getAllRooms: async () => {
    const [rows] = await db.query("SELECT * FROM chat_rooms WHERE status = 'active'");
    return rows;
  },

  // Get specialized rooms for a user
  getUserRooms: async (userId) => {
    const [rows] = await db.query(
      `SELECT cr.* FROM chat_rooms cr
       JOIN chat_room_members crm ON cr.id = crm.room_id
       WHERE crm.user_id = ? AND cr.status = 'active'`,
      [userId]
    );
    return rows;
  },

  // Get specific room via ID
  getRoomById: async (roomId) => {
    const [rows] = await db.query("SELECT * FROM chat_rooms WHERE id = ?", [roomId]);
    return rows[0];
  },

  // Member Management
  isMember: async (roomId, userId) => {
    const [rows] = await db.query(
      "SELECT * FROM chat_room_members WHERE room_id = ? AND user_id = ?",
      [roomId, userId]
    );
    return rows.length > 0;
  },

  getMemberInfo: async (roomId, userId) => {
    const [rows] = await db.query(
      "SELECT * FROM chat_room_members WHERE room_id = ? AND user_id = ?",
      [roomId, userId]
    );
    return rows[0];
  },

  addMember: async (roomId, userId, role = 'member') => {
    // Check if room is public or if private joining logic is required
    const room = await ChatRoomModel.getRoomById(roomId);
    if (!room) throw new Error("Phòng không tồn tại!");
    
    // Logic for private rooms (if needed in the future) can be added here
    
    const [result] = await db.query(
      "INSERT IGNORE INTO chat_room_members (room_id, user_id, role) VALUES (?, ?, ?)",
      [roomId, userId, role]
    );
    return result.affectedRows > 0;
  },

  // Create Author room (With Transaction)
  createAuthorRoom: async (authorId, name) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        "INSERT INTO chat_rooms (name, room_type, owner_id) VALUES (?, 'author_group', ?)",
        [name, authorId]
      );
      
      const roomId = result.insertId;
      
      // Add author as owner
      await connection.query(
        "INSERT INTO chat_room_members (room_id, user_id, role) VALUES (?, ?, 'owner')",
        [roomId, authorId]
      );

      await connection.commit();
      return roomId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = ChatRoomModel;
