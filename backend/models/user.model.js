const db = require("../config/db"); // db đã là db.promise()

const UserModel = {
  // Tìm người dùng theo username
  findByUsername: async (username) => {
    // Đã bao gồm password để login và changePassword dùng
    const [rows] = await db.query(
      "SELECT id, username, password, email, full_name, phone, avatar, role, gender, created_at, status, ban_until FROM users_new WHERE username = ?",
      [username]
    );
    return rows;
  },

  // Tạo người dùng mới (giữ nguyên)
  create: async (userData) => {
    const avatar = userData.avatar || "/uploads_img/avatar/default-avatar.jpg";
    const sql = `
      INSERT INTO users_new (username, password, email, full_name, phone, role, avatar, gender)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      userData.username,
      userData.password,
      userData.email,
      userData.full_name,
      userData.phone,
      userData.role || "user",
      avatar,
      userData.gender || "other",
    ];
    const [result] = await db.query(sql, values);
    return result;
  },

  // Tìm theo ID
  findById: async (id) => {
    const [rows] = await db.query(
      `
      SELECT id, username, password, email, full_name, phone, avatar, role, gender, created_at, status, ban_until
      FROM users_new WHERE id = ?
    `, // THÊM TRƯỜNG PASSWORD VÀ CÁC TRƯỜNG KHÁC CẦN THIẾT Ở ĐÂY
      [id]
    );
    return rows;
  },

  // ban người dùng (giữ nguyên)
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
    try {
      console.log("updatePassword Model: Attempting to update password for userId:", id);
      const [result] = await db.execute("UPDATE users_new SET password = ? WHERE id = ?", [
        hashedPassword,
        id,
      ]);
      console.log("updatePassword Model: Database update result:", result);
      return result.affectedRows;
    } catch (dbError) {
      console.error("updatePassword Model: Database error during password update:", dbError);
      throw dbError; // Rethrow lỗi để controller bắt
    }
  },

  // Cập nhật thông tin người dùng
  updateUser: async (id, updatedData) => {
    const fields = [];
    const values = [];

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
    if (updatedData.gender !== undefined) {
      fields.push("gender = ?");
      values.push(updatedData.gender);
    }
    // Xử lý avatar: Chỉ thêm vào update nếu thuộc tính 'avatar' tồn tại trong updatedData
    // Giá trị của updatedData.avatar có thể là đường dẫn mới hoặc null
    if (Object.prototype.hasOwnProperty.call(updatedData, 'avatar')) {
      fields.push("avatar = ?");
      values.push(updatedData.avatar);
    }

    if (fields.length === 0) {
      console.log("updateUser Model: No fields to update. Returning 0 affected rows.");
      return 0;
    }

    values.push(id);
    const sql = `UPDATE users_new SET ${fields.join(", ")} WHERE id = ?`;
    
    console.log("updateUser Model: SQL:", sql, "values:", values); // LOG SQL query

    try {
        const [result] = await db.query(sql, values);
        return result.affectedRows;
    } catch (dbError) {
        console.error("updateUser Model: Database error during user update:", dbError); // LOG lỗi DB
        throw dbError; // Rethrow lỗi để controller bắt
    }
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