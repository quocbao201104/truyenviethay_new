const taskService = require("../services/task.service");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await taskService.getAllTasks(userId);
    return successResponse(res, tasks, "Lay danh sach nhiem vu thanh cong");
  } catch (err) {
    return errorResponse(res, "Loi khi lay danh sach nhiem vu", 500);
  }
};

const assignTask = async (req, res) => {
  try {
    const { user_id, task_id } = req.body;
    const result = await taskService.assignTask(user_id, task_id);
    return successResponse(res, result, "Gan nhiem vu thanh cong");
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

const completeTask = async (req, res) => {
  try {
    const { task_id } = req.body;
    const userId = req.user.id;
    const result = await taskService.completeTask(userId, task_id);
    return successResponse(res, result, "Cap nhat tien do nhiem vu thanh cong");
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

const claimTask = async (req, res) => {
  try {
    const { task_id } = req.body;
    const userId = req.user.id;
    const result = await taskService.claimTask(userId, task_id);
    return successResponse(res, result, "Nhan thuong nhiem vu thanh cong");
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

module.exports = {
  getAllTasks,
  assignTask,
  completeTask,
  claimTask,
};
