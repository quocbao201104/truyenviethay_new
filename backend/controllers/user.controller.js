// backend/controllers/user.controller.js
const User = require("../models/user.model");

exports.getAllUsers = async (req, res) => {
    const { search, page = 1, limit = 10, role, status, sortBy, sortOrder } = req.query; 
    const offset = (page - 1) * limit;

    try {
        // Lấy danh sách người dùng và tổng số cho phân trang
        const { users, total } = await User.findAllUsers(search, parseInt(limit), offset, role, status, sortBy, sortOrder);

        // Lấy các số liệu thống kê tổng hợp
        const totalUsersCount = await User.getTotalUsersCount();
        const activeUsersCount = await User.getActiveUsersCount();
        const blockedUsersCount = await User.getBlockedUsersCount();
        const authorUsersCount = await User.getAuthorUsersCount();

        res.json({
            message: "Lấy danh sách người dùng thành công",
            data: users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                totalUsers: totalUsersCount,
                activeUsers: activeUsersCount,
                blockedUsers: blockedUsersCount,
                authorUsers: authorUsersCount,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng", error: err.message });
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
                status: user.status,
                ban_until: user.ban_until,
            },
        });
    } catch (err) {
        res.status(500).json({
            message: "Lỗi khi lấy thông tin người dùng",
            error: err.message,
        });
    }
};

exports.banUser = async (req, res) => {
    const userId = req.params.id;
    const { duration_days } = req.body;

    try {
        const userExists = await User.findById(userId);
        if (userExists.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng để cấm." });
        }

        if (req.user.id == userId && req.user.role === 'admin') {
            return res.status(403).json({ message: "Admin không thể tự cấm tài khoản của mình." });
        }

        let banUntil = null;
        if (duration_days && typeof duration_days === 'number' && duration_days > 0) {
            const date = new Date();
            date.setDate(date.getDate() + duration_days);
            banUntil = date;
        }

        const affectedRows = await User.updateStatus(userId, "blocked", banUntil);
        if (affectedRows === 0) {
            return res.status(400).json({ message: "Không thể cấm người dùng này." });
        }
        res.json({ message: `Người dùng ID ${userId} đã bị cấm thành công${banUntil ? ` đến ${banUntil.toLocaleString()}` : ' vĩnh viễn'}.` });
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi cấm người dùng", error: err.message });
    }
};

exports.unbanUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const userExists = await User.findById(userId);
        if (userExists.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng để bỏ cấm." });
        }

        if (req.user.id == userId && req.user.role === 'admin') {
            return res.status(403).json({ message: "Admin không thể tự bỏ cấm tài khoản của mình." });
        }

        const affectedRows = await User.updateStatus(userId, "active", null);
        if (affectedRows === 0) {
            return res.status(400).json({ message: "Không thể bỏ cấm người dùng này." });
        }
        res.json({ message: `Người dùng ID ${userId} đã được bỏ cấm thành công.` });
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi bỏ cấm người dùng", error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const users = await User.findById(userId);

        if (users.length === 0) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy người dùng để xóa" });
        }

        const user = users[0];

        if (req.user.id == userId) {
            return res.status(403).json({ message: "Bạn không thể xóa tài khoản của chính mình." });
        }

        if (user.role === "admin") {
            return res.status(403).json({
                message: "Không thể xóa tài khoản Admin khác.",
            });
        }
        
        const affectedRows = await User.deleteById(userId);

        if (affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng để xóa hoặc không có thay đổi." });
        }

        res.json({ message: "Xóa người dùng thành công!" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server khi xóa người dùng", error: err.message });
    }
};

exports.updateUserRole = async (req, res) => {
    const userId = req.params.id;
    const { newRole } = req.body;

    const allowedRoles = ['user', 'author', 'admin'];

    if (!newRole || !allowedRoles.includes(newRole)) {
        return res.status(400).json({ message: "Vai trò không hợp lệ." });
    }

    try {
        const userToUpdate = await User.findById(userId);
        if (userToUpdate.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng để cập nhật vai trò." });
        }

        const targetUser = userToUpdate[0];

        if (req.user.id == userId) {
            return res.status(403).json({ message: "Bạn không thể thay đổi vai trò của chính mình." });
        }

        if (targetUser.role === 'admin' && newRole !== 'admin') {
            return res.status(403).json({ message: "Không thể hạ vai trò của Admin khác." });
        }
        if (req.user.role === 'admin' && targetUser.role === 'admin' && newRole === 'admin') {
            return res.status(200).json({ message: "Vai trò người dùng không thay đổi." });
        }

        const affectedRows = await User.updateUserRole(userId, newRole);

        if (affectedRows === 0) {
            return res.status(400).json({ message: "Không thể cập nhật vai trò người dùng." });
        }

        res.json({ message: `Vai trò của người dùng ID ${userId} đã được cập nhật thành ${newRole}.` });
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi cập nhật vai trò người dùng", error: err.message });
    }
};