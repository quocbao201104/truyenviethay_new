// controllers/task.controller.js
const taskService = require("../services/task.service");

const getAllTasks = async (req, res) => {
  try {
    const tasks = await taskService.getAllTasks();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách nhiệm vụ" });
  }
};

const assignTask = async (req, res) => {
  try {
    const { user_id, task_id } = req.body;
    const result = await taskService.assignTask(user_id, task_id);
    res.status(200).json({ message: "Gán nhiệm vụ thành công", result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const completeTask = async (req, res) => {
  try {
    // console.log("req.user:", req.user); 

    const { task_id } = req.body;
    const user_id = req.user.id;

    const result = await taskService.completeTask(user_id, task_id);
    res.status(200).json({ message: "Hoàn thành nhiệm vụ thành công", result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllTasks,
  assignTask,
  completeTask,
};
