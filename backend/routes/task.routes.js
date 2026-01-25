const express = require("express");
const router = express.Router();
const taskController = require("../controllers/userTask.controller");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Route lấy danh sách nhiệm vụ
router.get("/", authenticateToken, taskController.getAllTasks);

// Route gán nhiệm vụ cho người dùng
router.post(
  "/assign",
  authenticateToken,
  authorizeRoles("admin"),
  taskController.assignTask
);

// Route hoàn thành nhiệm vụ
router.post("/complete", authenticateToken, taskController.completeTask);

module.exports = router;
