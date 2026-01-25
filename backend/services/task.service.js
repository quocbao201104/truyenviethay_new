// services/task.service.js
const Task = require("../models/userTask.model");
const UserLevelsHistory = require("../models/userLevelHistory.model");
const pointService = require("./userPoint.service");

const getAllTasks = async () => {
  return await Task.getAll();
};

const assignTask = async (userId, taskId) => {
  const task = await Task.getTaskById(taskId);
  if (!task) throw new Error("Nhiệm vụ không tồn tại");

  const userLevel = await UserLevelsHistory.getCurrentLevelOfUser(userId);
  if (!userLevel || Number(userLevel) !== Number(task.level_id)) {
    throw new Error("Cấp độ không phù hợp");
  }

  return await Task.assign(userId, taskId);
};

const completeTask = async (userId, taskId) => {
  const task = await Task.getTaskById(taskId);
  if (!task) throw new Error("Không tìm thấy nhiệm vụ");

  const result = await Task.complete(userId, taskId);
  const pointsReward = task.points_awarded ?? 0;

  await pointService.createOrUpdatePoints({
    user_id: userId,
    points: pointsReward,
  });

  return result;
};

module.exports = {
  getAllTasks,
  assignTask,
  completeTask,
};
