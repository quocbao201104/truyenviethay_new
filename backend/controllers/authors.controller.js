const AuthorModel = require("../models/author.model");
const AuthorFollowModel = require("../models/authorFollow.model");
const InventoryModel = require("../models/inventory.model");
const UserLevelHistory = require("../models/userLevelHistory.model");
const { invalidate } = require("../utils/cache");

const parseId = (value) => {
  const id = parseInt(value, 10);
  return Number.isFinite(id) ? id : null;
};

const getAuthorById = async (req, res) => {
  try {
    const authorId = parseId(req.params.authorId);
    if (!authorId) {
      return res.status(400).json({ message: "author_id không hợp lệ" });
    }

    const author = await AuthorModel.getById(authorId);
    if (!author) {
      return res.status(404).json({ message: "Không tìm thấy tác giả" });
    }

    const userId = author.user_id;
    const [levelId, equippedBadgesMap, equippedFramesMap] = await Promise.all([
      UserLevelHistory.getCurrentLevelOfUser(userId),
      InventoryModel.getEquippedBadgesForUsers([userId]),
      InventoryModel.getEquippedAvatarFramesForUsers([userId]),
    ]);

    author.level_id = levelId ?? null;
    author.badge = equippedBadgesMap.get(userId) || null;
    author.equipped_frame = equippedFramesMap.get(userId) || null;

    if (req.user?.id) {
      try {
        const rows = await AuthorFollowModel.isFollowing(req.user.id, authorId);
        author.is_followed = rows.length > 0;
      } catch (followErr) {
        // Do not fail the whole request if follow lookup has issues
        console.error("getAuthorById isFollowing error:", followErr);
        author.is_followed = false;
      }
    }

    res.json({ success: true, data: author });
  } catch (err) {
    console.error("getAuthorById error:", err);
    res.status(500).json({ message: "Lỗi server khi lấy tác giả" });
  }
};

const getTopAuthors = async (req, res) => {
  try {
    const { type = "monthly", limit } = req.query;
    const authors = await AuthorModel.getTopAuthors(type, limit);

    if (authors && authors.length > 0) {
      const userIds = authors.map((a) => a.user_id);
      const [equippedBadgesMap, equippedFramesMap] = await Promise.all([
        InventoryModel.getEquippedBadgesForUsers(userIds),
        InventoryModel.getEquippedAvatarFramesForUsers(userIds),
      ]);

      authors.forEach((author) => {
        const userId = author.user_id;
        author.badge = equippedBadgesMap.get(userId) || null;
        author.equipped_frame = equippedFramesMap.get(userId) || null;
      });
    }

    res.json({ success: true, data: authors });
  } catch (err) {
    console.error("getTopAuthors error:", err);
    res.status(500).json({ message: "Lỗi server khi lấy bảng xếp hạng tác giả" });
  }
};

const toggleFollowAuthor = async (req, res) => {
  try {
    const userId = req.user?.id;
    const authorId = parseId(req.params.authorId);
    if (!userId) return res.status(401).json({ message: "Ban chua dang nhap!" });
    if (!authorId) return res.status(400).json({ message: "author_id khong hop le" });

    const author = await AuthorModel.getById(authorId);
    if (!author) return res.status(404).json({ message: "Khong tim thay tac gia" });

    if (Number(author.user_id) === Number(userId)) {
      return res.status(400).json({ message: "Ban khong the tu theo doi chinh minh." });
    }

    const rows = await AuthorFollowModel.isFollowing(userId, authorId);
    if (rows.length > 0) {
      await AuthorFollowModel.removeFollow(userId, authorId);
      return res.json({ success: true, followed: false, message: "Da bo theo doi tac gia" });
    }

    await AuthorFollowModel.addFollow(userId, authorId);
    return res.json({ success: true, followed: true, message: "Da theo doi tac gia" });
  } catch (err) {
    console.error("toggleFollowAuthor error:", err);
    const status = err.code === "ER_NO_REFERENCED_ROW_2" ? 404 : 400;
    res.status(status).json({ message: err.message || "Co loi xay ra" });
  }
};

const updateAuthorProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const authorId = parseId(req.params.authorId);
    if (!userId) return res.status(401).json({ message: "Ban chua dang nhap!" });
    if (!authorId) return res.status(400).json({ message: "author_id khong hop le" });

    const author = await AuthorModel.getById(authorId);
    if (!author) return res.status(404).json({ message: "Khong tim thay tac gia" });

    if (userRole !== "admin" && Number(author.user_id) !== Number(userId)) {
      return res.status(403).json({ message: "Ban khong co quyen cap nhat tac gia nay." });
    }

    const { pen_name, bio } = req.body || {};

    const affectedRows = await AuthorModel.updateProfile(authorId, { pen_name, bio });
    if (affectedRows === 0) {
      return res.status(400).json({ message: "Khong co du lieu cap nhat." });
    }

    await invalidate("rank:authors");
    const updated = await AuthorModel.getById(authorId);
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("updateAuthorProfile error:", err);
    res.status(400).json({ message: err.message || "Co loi xay ra" });
  }
};

const updateMyAuthorProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Ban chua dang nhap!" });

    const author = await AuthorModel.getByUserId(userId);
    if (!author) return res.status(404).json({ message: "Khong tim thay tac gia" });

    const { pen_name, bio } = req.body || {};
    const affectedRows = await AuthorModel.updateProfile(author.id, { pen_name, bio });
    if (affectedRows === 0) {
      return res.status(400).json({ message: "Khong co du lieu cap nhat." });
    }

    await invalidate("rank:authors");
    const updated = await AuthorModel.getById(author.id);
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("updateMyAuthorProfile error:", err);
    res.status(400).json({ message: err.message || "Co loi xay ra" });
  }
};

module.exports = {
  getAuthorById,
  getTopAuthors,
  toggleFollowAuthor,
  updateAuthorProfile,
  updateMyAuthorProfile,
};






