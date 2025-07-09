const UserModel = require("../models/user.model");

exports.banUser = async (req, res) => {
  const { userId, banUntil } = req.body;

  console.log("Ban user:", { userId, banUntil });

  try {
    await UserModel.updateStatus(userId, "blocked", banUntil);
    res.json({ message: "Ban user thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi ban user", error: err.message });
  }
};
