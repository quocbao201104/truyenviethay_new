const db = require("../config/db"); // Kết nối DB

/** Lấy comment theo id (permission check + invalidate cache) */
exports.getCommentById = async (commentId) => {
  const [rows] = await db.query(
    `SELECT id, truyen_id, user_id, parent_id, created_at FROM comments WHERE id = ?`,
    [commentId]
  );
  return rows[0] || null;
};

/** Đếm tổng số parent comment của truyện */
exports.countByTruyen = async (truyenId) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS cnt
     FROM comments
     WHERE truyen_id = ?
       AND parent_id IS NULL
       AND (is_deleted = 0 OR is_deleted IS NULL)`,
    [truyenId]
  );
  return rows[0]?.cnt ?? 0;
};

/** Đếm số reply của comment (parent) */
exports.countReplies = async (parentId) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS cnt
     FROM comments
     WHERE parent_id = ?
       AND (is_deleted = 0 OR is_deleted IS NULL)`,
    [parentId]
  );
  return rows[0]?.cnt ?? 0;
};

exports.getCommentsByTruyen = async (truyenId, limit, offset) => {
  const [rows] = await db.query(
    `
      SELECT c.*, COALESCE(NULLIF(u.full_name, ''), u.username) AS author_name, u.avatar AS author_avatar
      FROM comments c
      JOIN users_new u ON c.user_id = u.id
      WHERE c.truyen_id = ?
        AND c.parent_id IS NULL
        AND (c.is_deleted = 0 OR c.is_deleted IS NULL)
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
      `,
    [truyenId, limit, offset]
  );
  return rows;
};

/** Lấy replies (cả deleted) — tombstone hiển thị phía service */
exports.getReplies = async (parentId) => {
  const [rows] = await db.query(
    `
    SELECT c.*, COALESCE(NULLIF(u.full_name, ''), u.username) AS author_name, u.avatar AS author_avatar
    FROM comments c
    JOIN users_new u ON c.user_id = u.id
    WHERE c.parent_id = ?
      AND (c.is_deleted = 0 OR c.is_deleted IS NULL)
    ORDER BY c.created_at ASC
    `,
    [parentId]
  );
  return rows;
};

exports.createComment = async (truyenId, userId, content, parentId = null) => {
  const [result] = await db.query(
    `INSERT INTO comments (truyen_id, user_id, content, parent_id, created_at) VALUES (?, ?, ?, ?, NOW())`,
    [truyenId, userId, content, parentId]
  );
  return result.insertId;
};

exports.softDeleteComment = async (commentId, deletedBy = null, deleteReason = null) => {
  const [result] = await db.query(
    `UPDATE comments 
     SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = ?, delete_reason = ?
     WHERE id = ?`,
    [deletedBy, deleteReason || null, commentId]
  );
  return result.affectedRows;
};
