const db = require("../config/db"); // db đã là db.promise()

const UserModel = {
  // Tìm người dùng theo username
  findByUsername: async (username) => {
    const [rows] = await db.query(
      "SELECT * FROM users_new WHERE username = ?",
      [username]
    );
    return rows;
  },

  // Tạo người dùng mới
  create: async (userData) => {
    const avatar = userData.avatar || "/uploads_img/avatar/default-avatar.jpg"; // Đường dẫn avatar mặc định

    const sql = `
      INSERT INTO users_new (username, password, email, full_name, phone, role, avatar,gender)
      VALUES (?, ?, ?, ?, ?, ?, ?,?)
    `;
    const values = [
      userData.username,
      userData.password,
      userData.email,
      userData.full_name,
      userData.phone,
      userData.role || "user",
      avatar, // Thêm avatar vào
      userData.gender || "other",
    ];

    const [result] = await db.query(sql, values);
    return result;
  },

  // Tìm theo ID
  findById: async (id) => {
    const [rows] = await db.query(
      `
      SELECT id, username, email, full_name, phone, avatar, role, gender, created_at
      FROM users_new WHERE id = ?
    `,
      [id]
    );
    // Nếu không tìm thấy user, trả về null
    return rows; //.length > 0 ? rows[0] : null
  },

  // ban người dùng
  updateStatus: async (userId, status, banUntil) => {
    await db.query(
      `UPDATE users_new SET status = ?, ban_until = ? WHERE id = ?`,
      [status, banUntil, userId]
    );
  },

  findByEmail: async (email) => {
    const [rows] = await db.query("SELECT * FROM users_new WHERE email = ?", [
      email,
    ]);
    return rows;
  },

  // Cập nhật mật khẩu mới
  updatePassword: async (id, hashedPassword) => {
    await db.execute("UPDATE users_new SET password = ? WHERE id = ?", [
      hashedPassword,
      id,
    ]);
  },

  // Cập nhật thông tin người dùng
  updateUser: async (id, updatedData) => {
    const fields = [];
    const values = [];

    // Cho phép avatar cập nhật một mình
    if (updatedData.full_name !== undefined) {
      fields.push("full_name = ?");
      values.push(updatedData.full_name);
    }
    if (updatedData.email !== undefined) {
      fields.push("email = ?");
      values.push(updatedData.email);
    }
    if (updatedData.phone !== undefined) {
      fields.push("phone = ?");
      values.push(updatedData.phone);
    }
    if (updatedData.avatar !== undefined) {
      fields.push("avatar = ?");
      values.push(updatedData.avatar);
    }
    if (updatedData.gender !== undefined) {
      fields.push("gender = ?");
      values.push(updatedData.gender);
    }

    if (fields.length === 0) return 0;

    values.push(id);
    const sql = `UPDATE users_new SET ${fields.join(", ")} WHERE id = ?`;
    const [result] = await db.query(sql, values);
    return result.affectedRows;
  },
  findAllUsers: async () => {
    const [rows] = await db.query(
      `SELECT id, username, role, status, ban_until, full_name FROM users_new`
    );
    return rows;
  },
  getUserById: async (id) => {
    const [rows] = await db.query(
      `SELECT id, username, role, status, ban_until, full_name FROM users_new WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  deleteById: async (id) => {
    const [result] = await db.query(`DELETE FROM users_new WHERE id = ?`, [id]);
    return result.affectedRows;
  },
};

module.exports = UserModel;
