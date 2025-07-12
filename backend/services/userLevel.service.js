const UserLevel = require("../models/userLevels.model");

const getAllLevels = async () => {
  try {
    const levels = await UserLevel.getAll();
    return levels;
  } catch (error) {
    throw new Error("Lỗi khi lấy danh sách cấp bậc: " + error.message);
  }
};

const getLevelById = async (id) => {
  try {
    const level = await UserLevel.getById(id);
    if (!level) {
      throw new Error("Không tìm thấy cấp bậc với ID: " + id);
    }
    return level;
  } catch (error) {
    throw new Error("Lỗi khi lấy cấp bậc: " + error.message);
  }
};

module.exports = {
  getAllLevels,
  getLevelById,
};
