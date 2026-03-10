const commentModel = require("../models/comment.model");
const UserLevelHistory = require("../models/userLevelHistory.model");
const InventoryModel = require("../models/inventory.model");
const { getOrSet, invalidate } = require("../utils/cache");

const LIMIT = 10;
const COMMENT_CACHE_TTL = 60;
const cacheKey = (truyenId, page) => `comments:${truyenId}:${page}`;

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
    obj.content = obj.is_deleted ? "[Binh luan da bi xoa]" : obj.content;
    return obj;
  };

  for (const comment of comments) {
    enrichComment(comment);
    comment.replies = (comment.replies || []).map((reply) => enrichComment(reply));
  }

  return comments;
};

exports.getComments = async (truyenId, page = 1) => {
  return getOrSet(cacheKey(truyenId, page), COMMENT_CACHE_TTL, () => fetchComments(truyenId, page));
};

exports.addComment = async (userId, truyenId, content, parentId) => {
  if (!content.trim()) throw new Error("Noi dung binh luan trong.");
  await commentModel.createComment(truyenId, userId, content, parentId);
  invalidate(`comments:${truyenId}`);
};

exports.removeComment = async (commentId, truyenId) => {
  await commentModel.softDeleteComment(commentId);
  if (truyenId) invalidate(`comments:${truyenId}`);
};

