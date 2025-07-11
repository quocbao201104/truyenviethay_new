// backend/controllers/auth.controller.js
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Đăng ký (giữ nguyên)
exports.register = async (req, res) => {
  const {
    username,
    password,
    email,
    full_name,
    phone,
    role = "user",
    avatar,
  } = req.body;

  if (!username || !password || !email || !full_name || !phone) {
    return res.status(400).json({ message: "Thiếu thông tin đăng ký" });
  }

  try {
    const existingUsers = await User.findByUsername(username);
    const emailExists = await User.findByEmail(email);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Username đã tồn tại" });
    }
    if (emailExists.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      username,
      password: hashedPassword,
      email,
      full_name,
      phone,
      role,
      avatar: avatar || "/uploads_img/avatar/default-avatar.jpg",
    };

    await User.create(newUser);
    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo user", error: err.message });
  }
};

// Đăng nhập (giữ nguyên)
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const results = await User.findByUsername(username);
    if (results.length === 0) {
      return res
        .status(401)
        .json({ message: "Tài khoản hoặc mật khẩu không đúng." });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ message: "Tài khoản hoặc mật khẩu không đúng." });
    }

    if (user.status === "blocked") {
      const now = new Date();
      const banUntil = user.ban_until ? new Date(user.ban_until) : null;

      if (!banUntil || banUntil > now) {
        return res.status(403).json({
          message: banUntil
            ? `Tài khoản bị khóa đến ${banUntil.toLocaleString()}`
            : `Tài khoản đã bị khóa vĩnh viễn`,
        });
      } else {
        await User.updateStatus(user.id, "active", null);
        user.status = "active";
        user.ban_until = null;
      }
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi đăng nhập", error: err.message });
  }
};

// Lấy thông tin người dùng (giữ nguyên)
exports.getMe = async (req, res) => {
  const userId = req.user.id;

  try {
    const results = await User.findById(userId);
    if (results.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const user = results[0];
    res.json({
      message: "Thông tin người dùng",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        gender: user.gender,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin người dùng",
      error: err.message,
    });
  }
};

// Cập nhật thông tin người dùng
exports.updateMe = async (req, res) => {
  const userId = req.user.id;
  const { full_name, email, phone, gender } = req.body;

  let avatarPathToDB;

  console.log("updateMe Controller: req.file:", req.file); // Debug file được Multer xử lý
  console.log("updateMe Controller: req.body.avatar:", req.body.avatar); // Debug giá trị avatar từ form-data (nếu không phải file)

  if (req.file) {

    avatarPathToDB = "/uploads_img/avatar/" + req.file.filename;
    console.log("Avatar mới từ upload:", avatarPathToDB);
  } else if (req.body.remove_avatar === "true") {
    avatarPathToDB = null;
    console.log("Xoá avatar theo yêu cầu");
  } else {
    avatarPathToDB = undefined;
    console.log("Avatar giữ nguyên");
  }
  const updateData = {};

  if (avatarPathToDB !== undefined) {
    updateData.avatar = avatarPathToDB;

  }

  try {
    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (gender !== undefined) updateData.gender = gender;


    // CHỈ THÊM THUỘC TÍNH `avatar` VÀO `updateData` NẾU CÓ SỰ THAY ĐỔI VỀ AVATAR (file mới HOẶC yêu cầu xóa)
    // Tức là avatarPathToDB đã được gán giá trị (không phải undefined)
    if (
      req.file ||
      (req.body.hasOwnProperty("avatar") &&
        (req.body.avatar === "" || req.body.avatar === "null"))
    ) {
      updateData.avatar = avatarPathToDB; // Đây có thể là đường dẫn mới hoặc null
      console.log(
        "updateMe Controller: Avatar field added to updateData:",
        updateData.avatar
      );
    } else {
      console.log(
        "updateMe Controller: Avatar field NOT added to updateData (no change)."
      );
    }

    console.log(
      "updateMe Controller: Final updateData sent to model:",
      updateData
    );

    if (Object.keys(updateData).length === 0) {
      return res
        .status(200)
        .json({ message: "Không có thông tin nào được thay đổi để cập nhật." });
    }

    const affectedRows = await User.updateUser(userId, updateData);
    console.log(
      "updateMe Controller: User.updateUser affected rows:",
      affectedRows
    );

    if (affectedRows === 0) {
      return res.status(200).json({
        message:
          "Cập nhật thành công nhưng không có thay đổi nào được ghi nhận trong DB.",
      });
    }

    // LẤY LẠI THÔNG TIN USER MỚI NHẤT SAU KHI CẬP NHẬT TỪ DB
    // Quan trọng để frontend có dữ liệu mới nhất
    const updatedUserResults = await User.findById(userId); // Sử dụng findById đã được sửa để lấy password
    const updatedUser = updatedUserResults[0];


    res.json({ message: "Cập nhật thông tin thành công!", user: updatedUser }); // TRẢ VỀ USER MỚI NHẤT
  } catch (err) {
    console.error("Lỗi server khi cập nhật thông tin trong updateMe:", err);
    res.status(500).json({
      message: "Lỗi server khi cập nhật thông tin",
      error: err.message,
    });
  }
};

// Đổi mật khẩu (giữ nguyên các thay đổi debug đã có)
exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { old_password, new_password } = req.body;

  console.log("changePassword Controller: userId:", userId);
  console.log(
    "changePassword Controller: old_password received:",
    old_password ? "******" : "empty"
  );
  console.log(
    "changePassword Controller: new_password received:",
    new_password ? "******" : "empty"
  );

  if (!old_password || !new_password) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới." });

  }

  try {
    const results = await User.findById(userId);
    if (results.length === 0) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    const user = results[0];
    console.log(
      "changePassword Controller: User found. User password (partial):",
      user.password ? user.password.substring(0, 10) + "..." : "N/A"
    );


    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      console.log("changePassword Controller: Old password mismatch.");
      return res.status(400).json({ message: "Mật khẩu cũ không đúng." });
    }

    const isNewPasswordSameAsOld = await bcrypt.compare(
      new_password,
      user.password
    );
    if (isNewPasswordSameAsOld) {
      console.log(
        "changePassword Controller: New password is same as old password (after hash compare)."
      );
      return res
        .status(400)
        .json({ message: "Mật khẩu mới không được giống mật khẩu cũ." });

    }

    const hashed = await bcrypt.hash(new_password, 10);
    console.log("changePassword Controller: New password hashed.");

    const updatedAffectedRows = await User.updatePassword(userId, hashed);

    console.log(
      "changePassword Controller: updatePassword affected rows:",
      updatedAffectedRows
    );

    if (updatedAffectedRows === 0) {
      return res.status(400).json({
        message:
          "Không thể cập nhật mật khẩu. Có thể mật khẩu mới giống mật khẩu cũ.",
      });
    
    
    }

    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    console.error(
      "Lỗi server khi đổi mật khẩu trong changePassword Controller:",
      err
    );

    res.status(500).json({
      message: "Lỗi server khi đổi mật khẩu",
      error: err.message,
    });
  }
};

// Các hàm khác (giữ nguyên)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAllUsers();
        res.json({ data: users });
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy danh sách người dùng", error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    const userId = req.params.id;

    try {
        const users = await User.findById(userId);

        if (users.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        const user = users[0];
        res.json({
            message: "Thông tin người dùng",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role,
                created_at: user.created_at,
            },
        });
    } catch (err) {
        res.status(500).json({
            message: "Lỗi khi lấy thông tin người dùng",
            error: err.message,
        });
    }
};

exports.deleteUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const users = await User.findById(userId);

        if (users.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng để xóa" });
        }

        const user = users[0];

        if (user.role === "author") {
            return res.status(400).json({
                message: "Không thể xóa tài khoản tác giả qua API này. Hệ thống sẽ xử lý riêng.",
            });
        }

        const affectedRows = await User.deleteById(userId);

        res.json({ message: "Xóa người dùng thành công!" });
    } catch (err) {
        console.error("deleteUser error:", err);
        res.status(500).json({ message: "Lỗi server khi xóa người dùng" });
    }
};