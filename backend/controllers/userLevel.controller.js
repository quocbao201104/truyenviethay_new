const levelService = require("../services/userLevel.service");
const getAllLevels = async (req, res) => {
  try {
    const levels = await levelService.getAllLevels();
    res.json(levels);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách cấp bậc" });
  }
};

const getLevelById = async (req, res) => {
  try {
    const id = req.params.id;
    const level = await levelService.getLevelById(id);
    if (!level) {
      return res.status(404).json({ message: "Không tìm thấy cấp bậc" });
    }
    res.json(level);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy cấp bậc" });
  }
};

module.exports = {
  getAllLevels,
  getLevelById,
};
