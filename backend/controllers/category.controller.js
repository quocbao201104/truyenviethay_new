// controllers/category.controller.js
const TheLoaiModel = require("../models/category.model");

// Lấy tất cả thể loại
const getAllTheLoai = async (req, res) => {
  try {
    const list = await TheLoaiModel.getAll();
    res.status(200).json({ data: list });
  } catch (err) {
    console.error("Lỗi lấy thể loại:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// Lấy thể loại theo truyện
const getGenresByStory = async (req, res) => {
  const { storyId } = req.params;
  try {
    const genres = await TheLoaiModel.getByStoryId(storyId);
    res.status(200).json({ data: genres });
  } catch (err) {
    console.error("Lỗi lấy thể loại truyện:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// Lọc truyện theo nhiều thể loại
const filterStoriesByGenres = async (req, res) => {
  const { theloai = "", page = 1, limit = 10 } = req.query;

  if (!theloai) {
    return res.status(400).json({ message: "Thiếu tham số 'theloai'" });
  }

  const genreIds = theloai
    .split(",")
    .map((id) => parseInt(id.trim()))
    .filter(Boolean);
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const stories = await TheLoaiModel.filterByGenreIds(
      genreIds,
      offset,
      parseInt(limit)
    );
    res.status(200).json({ data: stories });
  } catch (err) {
    console.error("Lỗi lọc truyện theo nhiều thể loại:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
module.exports = {
  getAllTheLoai,
  getGenresByStory,
  filterStoriesByGenres,
};
