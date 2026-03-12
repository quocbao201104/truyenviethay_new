// services/follow.service.js

const followModel = require("../models/follow.model");
const readingStateModel = require("../models/readingState.model");
const formatTimeAgo = require("../utils/time"); 

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const clampLimit = (val) => Math.min(MAX_LIMIT, Math.max(1, parseInt(val, 10) || DEFAULT_LIMIT));

// Lấy danh sách truyện theo dõi với phân trang
exports.getFollowedStories = async (userId, page = 1, limit = DEFAULT_LIMIT) => {
  const safeLimit = clampLimit(limit);
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (safePage - 1) * safeLimit;

  const [stories] = await followModel.getFollowedStories(userId, offset, safeLimit);
  const [totalFollowCount] = await followModel.getFollowCount(userId);
  const total = totalFollowCount[0].count;
  const totalPages = Math.ceil(total / safeLimit) || 1;

  const truyenIds = stories.map((s) => s.id);
  const readingStates = await readingStateModel.getByUserAndStories(userId, truyenIds);
  const rsMap = new Map(readingStates.map((r) => [r.truyen_id, r]));

  const data = stories.map((story) => {
    const lastUpdate = story.thoi_gian_cap_nhat
      ? formatTimeAgo(story.thoi_gian_cap_nhat)
      : "Chưa có chương";
    const rs = rsMap.get(story.id);
    return { ...story, lastUpdate, is_followed: true, last_read_chuong_id: rs?.last_read_chuong_id ?? null };
  });

  return {
    data,
    pagination: {
      current_page: safePage,
      total_pages: totalPages,
      total,
      limit: safeLimit,
    },
  };
};

// Toggle theo dõi (Thêm hoặc xóa theo dõi)
exports.toggleFollow = async (userId, truyenId) => {
  const [rows] = await followModel.isFollowing(userId, truyenId); 
  if (rows.length > 0) {
    await followModel.removeFollow(userId, truyenId);
    return { success: true, message: "Đã bỏ theo dõi" };
  } else {
    await followModel.addFollow(userId, truyenId);
    return { success: true, message: "Đã theo dõi" };
  }
};
