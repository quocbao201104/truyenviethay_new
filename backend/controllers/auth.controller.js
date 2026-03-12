// backend/controllers/auth.controller.js
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const slugify = require("slugify");
const UserLevelHistory = require("../models/userLevelHistory.model");
const InventoryModel = require("../models/inventory.model");

const buildDecoratedUser = async (baseUser) => {
    const userId = baseUser.id;
    const [levelId, equippedBadgesMap, equippedFramesMap] = await Promise.all([
        UserLevelHistory.getCurrentLevelOfUser(userId),
        InventoryModel.getEquippedBadgesForUsers([userId]),
        InventoryModel.getEquippedAvatarFramesForUsers([userId]),
    ]);

    return {
        ...baseUser,
        level_id: levelId ?? null,
        badge: equippedBadgesMap.get(userId) || null,
        equipped_frame: equippedFramesMap.get(userId) || null,
    };
};

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
        return res.status(400).json({ message: "Thieu thong tin dang ky" });
    }

    try {
        const existingUsers = await User.findByUsername(username);
        const emailExists = await User.findByEmail(email);

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Username da ton tai" });
        }
        if (emailExists.length > 0) {
            return res.status(400).json({ message: "Email da ton tai" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            password: hashedPassword,
            email,
            full_name,
            phone,
            role,
            avatar: avatar || null,
        });

        res.status(201).json({ message: "Dang ky thanh cong" });
    } catch (err) {
        res.status(500).json({ message: "Loi tao user", error: err.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const results = await User.findByUsername(username);
        if (results.length === 0) {
            return res.status(401).json({ message: "Tai khoan hoac mat khau khong dung." });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Tai khoan hoac mat khau khong dung." });
        }

        if (user.status === "blocked") {
            const now = new Date();
            const banUntil = user.ban_until ? new Date(user.ban_until) : null;

            if (!banUntil || banUntil > now) {
                return res.status(403).json({
                    message: banUntil
                        ? `Tai khoan bi khoa den ${banUntil.toLocaleString()}`
                        : "Tai khoan da bi khoa vinh vien",
                });
            }

            await User.updateStatus(user.id, "active", null);
            user.status = "active";
            user.ban_until = null;
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        try {
            const taskService = require("../services/task.service");
            const loginEvent = {
                eventType: "daily_login",
                eventRef: `login:${new Date().toISOString().slice(0, 10)}`,
            };
            taskService.completeTaskByName(user.id, "\u0110\u0103ng nh\u1eadp h\u00e0ng ng\u00e0y", loginEvent).catch((error) => {
                console.error("Gamification Login Error:", error.message);
            });
        } catch (error) {
            console.error("Gamification Setup Error:", error.message);
        }

        const decoratedUser = await buildDecoratedUser({
            id: user.id,
            username: user.username,
            role: user.role,
            full_name: user.full_name,
            avatar: user.avatar || null,
        });

        res.json({
            message: "Dang nhap thanh cong",
            token,
            user: decoratedUser,
        });
    } catch (err) {
        res.status(500).json({ message: "Loi dang nhap", error: err.message });
    }
};

exports.getMe = async (req, res) => {
    const userId = req.user.id;

    try {
        const results = await User.findById(userId);
        if (results.length === 0) {
            return res.status(404).json({ message: "Khong tim thay nguoi dung" });
        }

        const user = results[0];

        let newToken = null;
        if (req.user.role !== user.role) {
            newToken = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );
            console.log(`New token issued for user ${userId} due to role change: ${req.user.role} -> ${user.role}`);
        }

        const decoratedUser = await buildDecoratedUser({
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            avatar: user.avatar,
            role: user.role,
            gender: user.gender,
            created_at: user.created_at,
        });

        res.json({
            message: "Thong tin nguoi dung",
            token: newToken,
            user: decoratedUser,
        });
    } catch (err) {
        res.status(500).json({
            message: "Loi khi lay thong tin nguoi dung",
            error: err.message,
        });
    }
};

exports.updateMe = async (req, res) => {
    const userId = req.user.id;
    const { full_name, email, phone, gender } = req.body;

    let avatarPathToDB;
    if (req.file) {
        avatarPathToDB = req.file.path;
    } else if (req.body.remove_avatar === "true" || req.body.avatar === "null" || req.body.avatar === "") {
        avatarPathToDB = null;
    } else {
        avatarPathToDB = undefined;
    }

    const updateData = {};
    if (avatarPathToDB !== undefined) updateData.avatar = avatarPathToDB;

    try {
        if (full_name !== undefined) updateData.full_name = full_name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (gender !== undefined) updateData.gender = gender;

        if (Object.keys(updateData).length === 0) {
            return res.status(200).json({ message: "Khong co thong tin nao duoc thay doi de cap nhat." });
        }

        const affectedRows = await User.updateUser(userId, updateData);
        if (affectedRows === 0) {
            return res.status(200).json({
                message: "Cap nhat thanh cong nhung khong co thay doi nao duoc ghi nhan trong DB.",
            });
        }

        const updatedUserResults = await User.findById(userId);
        const updatedUser = updatedUserResults[0];

        try {
            const taskService = require("../services/task.service");
            const profileEvent = {
                eventType: "profile_update",
                eventRef: `profile:${userId}`,
            };
            await taskService.completeTaskByName(userId, "C\u1eadp nh\u1eadt h\u1ed3 s\u01a1", profileEvent);
        } catch (taskErr) {
            console.error("Gamification Trigger Error:", taskErr.message);
        }

        const decoratedUser = await buildDecoratedUser({
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            full_name: updatedUser.full_name,
            phone: updatedUser.phone,
            avatar: updatedUser.avatar,
            role: updatedUser.role,
            gender: updatedUser.gender,
            created_at: updatedUser.created_at,
        });

        res.json({ message: "Cap nhat thong tin thanh cong!", user: decoratedUser });
    } catch (err) {
        res.status(500).json({
            message: "Loi server khi cap nhat thong tin",
            error: err.message,
        });
    }
};

exports.changePassword = async (req, res) => {
    const userId = req.user.id;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
        return res.status(400).json({ message: "Vui long nhap day du mat khau cu va mat khau moi." });
    }

    try {
        const results = await User.findById(userId);
        if (results.length === 0) {
            return res.status(404).json({ message: "Nguoi dung khong ton tai." });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(old_password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mat khau cu khong dung." });
        }

        const isNewPasswordSameAsOld = await bcrypt.compare(new_password, user.password);
        if (isNewPasswordSameAsOld) {
            return res.status(400).json({ message: "Mat khau moi khong duoc giong mat khau cu." });
        }

        const hashed = await bcrypt.hash(new_password, 10);
        const updatedAffectedRows = await User.updatePassword(userId, hashed);

        if (updatedAffectedRows === 0) {
            return res.status(400).json({
                message: "Khong the cap nhat mat khau. Co the mat khau moi giong mat khau cu.",
            });
        }

        res.json({ message: "Doi mat khau thanh cong!" });
    } catch (err) {
        res.status(500).json({
            message: "Loi server khi doi mat khau",
            error: err.message,
        });
    }
};

exports.googleLogin = async (req, res) => {
    const token = req.body.token || req.body.idToken || req.body.credential;

    if (!token) {
        console.error("Google Login Error: Missing token in request body", req.body);
        return res.status(400).json({
            message: "Thieu token xac thuc Google",
            receivedFields: Object.keys(req.body),
        });
    }

    try {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        OAuth2Client.CLOCK_SKEW_SECS_ = 10000;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        let users = await User.findByGoogleId(googleId);
        let user = users[0];

        if (!user) {
            users = await User.findByEmail(email);
            user = users[0];

            if (user) {
                await User.linkGoogleAccount(user.id, googleId);
            } else {
                const username = `${slugify(name, { lower: true, strict: true })}${Math.floor(Math.random() * 10000)}`;
                const randomPassword = `${Math.random().toString(36).slice(-8)}${Math.random().toString(36).slice(-8)}`;
                const hashedPassword = await bcrypt.hash(randomPassword, 10);

                const result = await User.create({
                    username,
                    password: hashedPassword,
                    email,
                    full_name: name,
                    phone: "",
                    role: "user",
                    avatar: picture,
                    gender: "other",
                    google_id: googleId,
                });

                const createdUsers = await User.findById(result.insertId);
                user = createdUsers[0];
            }
        }

        if (user.status === "blocked") {
            return res.status(403).json({ message: "Tai khoan da bi khoa" });
        }

        const jwtToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        try {
            const taskService = require("../services/task.service");
            const loginEvent = {
                eventType: "daily_login",
                eventRef: `login:${new Date().toISOString().slice(0, 10)}`,
            };
            taskService.completeTaskByName(user.id, "\u0110\u0103ng nh\u1eadp h\u00e0ng ng\u00e0y", loginEvent).catch((error) => {
                console.error("AGL Error:", error.message);
            });
        } catch (error) {
            console.error("Google login task trigger error:", error.message);
        }

        const decoratedUser = await buildDecoratedUser({
            id: user.id,
            username: user.username,
            role: user.role,
            full_name: user.full_name,
            avatar: user.avatar,
        });

        res.json({
            message: "Dang nhap Google thanh cong",
            token: jwtToken,
            user: decoratedUser,
        });
    } catch (err) {
        console.error("Google Login Verification Error:", {
            error: err.message,
            stack: err.stack,
            clientId: process.env.GOOGLE_CLIENT_ID ? "PRESENT" : "MISSING",
        });
        res.status(400).json({
            message: "Xac thuc Google that bai",
            error: err.message,
            debug: process.env.NODE_ENV === "development" ? err.message : undefined,
        });
    }
};


