const db = require("../config/db");

const FileModel = {
  // Lưu thông tin file vào bảng files
  saveFile: async ({ truyen_id, user_id, file_path, format }) => {
    const [result] = await db.query(
      `INSERT INTO files (truyen_id, user_id, file_path, format, uploaded_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [truyen_id, user_id, file_path, format]
    );
    return result.insertId; // trả về file_id
  },

  // Lưu nội dung text sau khi trích xuất
  saveFileContent: async ({ file_id, truyen_id, user_id, noi_dung_txt }) => {
    const [result] = await db.query(
      `INSERT INTO file_contents (file_id, truyen_id, user_id, noi_dung_txt, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [file_id, truyen_id, user_id, noi_dung_txt]
    );
    return result;
  },

  // Kiểm tra quyền sở hữu truyện
  isOwnerOfStory: async ({ truyen_id, user_id }) => {
    const [rows] = await db.query(
      `SELECT id FROM truyen_new WHERE id = ? AND user_id = ?`,
      [truyen_id, user_id]
    );
    return rows.length > 0;
  },
};

module.exports = FileModel;
