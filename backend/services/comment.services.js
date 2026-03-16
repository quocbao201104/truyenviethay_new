const db = require("../config/db");
const commentModel = require("../models/comment.model");
const UserLevelHistory = require("../models/userLevelHistory.model");
const InventoryModel = require("../models/inventory.model");
const { getOrSet, invalidate } = require("../utils/cache");

const SELF_DELETE_WINDOW_MS = 15 * 60 * 1000; // 15 phút

const LIMIT = 10;
const COMMENT_CACHE_TTL = 60;
const cacheKey = (truyenId, page) => `comments:${truyenId}:${page}`;
const countCacheKey = (truyenId) => `comments:count:${truyenId}`;

const fetchSingleComment = async (commentId) => {
  const [rows] = await db.query(
    `
    SELECT c.*, COALESCE(NULLIF(u.full_name, ''), u.username) AS author_name, u.avatar AS author_avatar
    FROM comments c
    JOIN users_new u ON c.user_id = u.id
    WHERE c.id = ?
    `,
    [commentId]
  );
  if (rows.length === 0) return null;
  
  const comment = rows[0];
  const userId = comment.user_id;

  const [levelMap, badgeMap, frameMap] = await Promise.all([
    UserLevelHistory.getCurrentLevelsForUsers([userId]),
    InventoryModel.getEquippedBadgesForUsers([userId]),
    InventoryModel.getEquippedAvatarFramesForUsers([userId]),
  ]);

  comment.author_level_id = levelMap.get(userId) ?? null;
  comment.author_badge = badgeMap.get(userId) ?? null;
  comment.author_frame = frameMap.get(userId) ?? null;
  if (comment.created_at && typeof comment.created_at === 'string') {
    comment.created_at = comment.created_at.replace(" ", "T") + "Z";
  }
  comment.replies = [];

  return comment;
};

const fetchComments = async (truyenId, page) => {
  const offset = (page - 1) * LIMIT;
  const comments = await commentModel.getCommentsByTruyen(truyenId, LIMIT, offset);

  for (const comment of comments) {
    comment.replies = await commentModel.getReplies(comment.id);
  }

  const userIds = [
    ...new Set(
      comments.flatMap((comment) => [comment.user_id, ...(comment.replies || []).map((reply) => reply.user_id)])
    ),
  ];

  const [levelMap, badgeMap, frameMap] = await Promise.all([
    UserLevelHistory.getCurrentLevelsForUsers(userIds),
    InventoryModel.getEquippedBadgesForUsers(userIds),
    InventoryModel.getEquippedAvatarFramesForUsers(userIds),
  ]);

  const enrichComment = (obj) => {
    obj.author_level_id = levelMap.get(obj.user_id) ?? null;
    obj.author_badge = badgeMap.get(obj.user_id) ?? null;
    obj.author_frame = frameMap.get(obj.user_id) ?? null;
    obj.content = obj.is_deleted ? "[Bình luận đã bị xóa]" : obj.content;
    if (obj.created_at && typeof obj.created_at === 'string' && !obj.created_at.endsWith('Z')) {
      obj.created_at = obj.created_at.replace(" ", "T") + "Z";
    }
    return obj;
  };

  for (const comment of comments) {
    enrichComment(comment);
    comment.replies = (comment.replies || []).map((reply) => enrichComment(reply));
  }

  return comments;
};

exports.getComments = async (truyenId, page = 1) => {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const [data, total] = await Promise.all([
    getOrSet(cacheKey(truyenId, safePage), COMMENT_CACHE_TTL, () => fetchComments(truyenId, safePage)),
    getOrSet(countCacheKey(truyenId), COMMENT_CACHE_TTL, () => commentModel.countByTruyen(truyenId)),
  ]);
  const totalPages = Math.ceil(total / LIMIT) || 1;
  return {
    data,
    pagination: { page: safePage, limit: LIMIT, total, total_pages: totalPages },
    total,
  };
};

exports.addComment = async (userId, truyenId, content, parentId) => {
  if (!content.trim()) throw new Error("Noi dung binh luan trong.");
  const insertId = await commentModel.createComment(truyenId, userId, content, parentId);
  invalidate(`comments:${truyenId}`);
  invalidate(countCacheKey(truyenId));
  
  // Return the full comment object for instant frontend update
  return await fetchSingleComment(insertId);
};

/** Kiểm tra quyền xóa: admin | author của truyện | chủ comment (trong 15p hoặc chưa có reply) */
exports.canDeleteComment = async (commentId, userId, userRole) => {
  const comment = await commentModel.getCommentById(commentId);
  if (!comment) return { ok: false, message: "Bình luận không tồn tại." };
  if (userRole === "admin") return { ok: true, comment };
  const [storyRow] = await db.query(
    `SELECT user_id FROM truyen_new WHERE id = ?`,
    [comment.truyen_id]
  );
  const storyAuthorId = storyRow[0]?.user_id ?? null;
  if (storyAuthorId === userId) return { ok: true, comment }; // Author moderate
  if (comment.user_id !== userId) return { ok: false, message: "Bạn không có quyền xóa bình luận này." };
  const replyCount = await commentModel.countReplies(commentId);
  if (replyCount > 0) return { ok: false, message: "Không thể xóa vì đã có phản hồi." };
  const createdAt = new Date(comment.created_at).getTime();
  if (Date.now() - createdAt > SELF_DELETE_WINDOW_MS) {
    return { ok: false, message: "Chỉ được xóa trong 15 phút sau khi đăng." };
  }
  return { ok: true, comment };
};

/** Custom error với status cho controller */
function ApiError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/** Xóa comment theo id (kiểm tra permission trước) */
exports.removeComment = async (commentId, userId, userRole, deleteReason = null) => {
  const { ok, message, comment } = await exports.canDeleteComment(commentId, userId, userRole);
  if (!ok) {
    const status = message.includes("tồn tại") ? 404 : 403;
    throw ApiError(message, status);
  }
  await commentModel.softDeleteComment(commentId, userId, deleteReason);
  invalidate(`comments:${comment.truyen_id}`);
  invalidate(countCacheKey(comment.truyen_id));
};
