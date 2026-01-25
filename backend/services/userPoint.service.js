const UserPoint = require("../models/userPoint.model");

const getPointsByUserId = async (userId) => {
  return await UserPoint.getPointsByUserId(userId);
};

const createOrUpdatePoints = async ({ user_id, points }) => {
  if (typeof points !== "number" || isNaN(points)) {
    throw new Error("Giá trị điểm thưởng không hợp lệ");
  }

  console.log("🛠 Đang tạo/cập nhật điểm:", { user_id, points });

  return await UserPoint.createOrUpdate({ user_id, points });
};

module.exports = {
  getPointsByUserId,
  createOrUpdatePoints,
};
