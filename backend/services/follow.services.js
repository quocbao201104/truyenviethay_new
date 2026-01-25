// services/follow.service.js

const followModel = require("../models/follow.model");
const { formatTimeAgo } = require("../utils/time"); 

// Lấy danh sách truyện theo dõi với phân trang
exports.getFollowedStories = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  // Lấy danh sách truyện đã theo dõi
  const [stories] = await followModel.getFollowedStories(userId, offset, limit);

  // Lấy tổng số truyện đã theo dõi
  const [totalFollowCount] = await followModel.getFollowCount(userId);

  console.log(`[Follow Service] userId: ${userId}, page: ${page}, limit: ${limit}`);
  console.log(`[Follow Service] Stories found: ${stories.length}, Total: ${totalFollowCount[0].count}`);

  // Xử lý thông tin chương mới nhất và thời gian
  const result = stories.map((story) => {
    const lastUpdate = story.chuong_moi_nhat_so_chuong
      ? formatTimeAgo(story.chuong_moi_nhat_so_chuong)
      : "Chưa có chương";
    return {
      ...story,
      lastUpdate,
    };
  });

  return {
    stories: result,
    totalCount: totalFollowCount[0].count,
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
