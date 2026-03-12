const Task = require("../models/userTask.model");
const { getOrSet, invalidate } = require("../utils/cache");
const logger = require("../utils/logger");

const TASK_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CLAIMED: "claimed",
  EXPIRED: "expired",
};

const REPEAT_TYPE = {
  ONCE: "once",
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  INFINITE: "infinite",
};

const DEFAULT_PROGRESS_TARGET = 1;

const pad = (value) => String(value).padStart(2, "0");

const getIsoWeek = (date) => {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  return {
    year: target.getUTCFullYear(),
    week: weekNo,
  };
};

const getPeriodKey = (repeatType, date = new Date()) => {
  const type = String(repeatType || REPEAT_TYPE.DAILY).toLowerCase();

  if (type === REPEAT_TYPE.ONCE) return REPEAT_TYPE.ONCE;
  if (type === REPEAT_TYPE.DAILY) {
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  }
  if (type === REPEAT_TYPE.WEEKLY) {
    const { year, week } = getIsoWeek(date);
    return `${year}-W${pad(week)}`;
  }
  if (type === REPEAT_TYPE.MONTHLY) {
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
  }
  return null;
};

const getProgressTarget = () => DEFAULT_PROGRESS_TARGET;

const recordTaskEvent = async (connection, userId, taskId, userTaskId, eventType, eventRef) => {
  if (!eventType || !eventRef) return true;
  try {
    await connection.execute(
      `INSERT INTO task_events (user_id, task_id, user_task_id, event_type, event_ref)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, taskId, userTaskId, eventType, eventRef]
    );
    return true;
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return false;
    }
    throw err;
  }
};

const getTaskWindow = (task, date = new Date()) => {
  const repeatType = String(task?.repeat_type || REPEAT_TYPE.DAILY).toLowerCase();
  return {
    repeatType,
    periodKey: getPeriodKey(repeatType, date),
  };
};

const getTaskCacheKey = (userId) => {
  const today = getPeriodKey(REPEAT_TYPE.DAILY);
  return `tasks:${userId}:${today}`;
};

const shouldProvisionTask = (repeatType) => {
  const type = String(repeatType || REPEAT_TYPE.DAILY).toLowerCase();
  return type !== REPEAT_TYPE.INFINITE;
};

const pickTaskRowForCurrentWindow = (task, rows = [], date = new Date()) => {
  if (!rows || rows.length === 0) return null;

  const { repeatType, periodKey } = getTaskWindow(task, date);
  const sortedRows = [...rows].sort((a, b) => {
    const timeA = new Date(a.assigned_at || 0).getTime();
    const timeB = new Date(b.assigned_at || 0).getTime();
    if (timeA !== timeB) return timeB - timeA;
    return Number(b.id || 0) - Number(a.id || 0);
  });

  if (repeatType === REPEAT_TYPE.ONCE) {
    return sortedRows.find((row) => row.period_key === REPEAT_TYPE.ONCE) || sortedRows[0];
  }

  if (periodKey) {
    return sortedRows.find((row) => row.period_key === periodKey) || null;
  }

  return sortedRows[0];
};

const buildUserTaskPayload = (task, row) => ({
  user_task_id: row?.id || null,
  task_id: task.task_id,
  task_name: task.task_name,
  description: task.description || null,
  points_awarded: Number(task.points_awarded || 0),
  level_id: task.level_id ?? null,
  repeat_type: task.repeat_type || REPEAT_TYPE.DAILY,
  status: row?.status || null,
  progress_current: Number(row?.progress_current || 0),
  progress_target: Number(row?.progress_target || getProgressTarget(task)),
  assigned_at: row?.assigned_at || null,
  completed_at: row?.completed_at || null,
  claimed_at: row?.claimed_at || null,
  is_claimable: row?.status === TASK_STATUS.COMPLETED,
});

const refreshTaskRowForPeriod = async (connection, rowId, periodKey, progressTarget, now) => {
  await connection.execute(
    `UPDATE user_tasks
     SET period_key = ?,
         status = ?,
         progress_current = 0,
         progress_target = ?,
         assigned_at = ?,
         completed_at = NULL,
         claimed_at = NULL,
         source_event = NULL,
         source_ref = NULL
     WHERE id = ?`,
    [periodKey, TASK_STATUS.PENDING, progressTarget, now, rowId]
  );
};

const provisionTaskRow = async (connection, userId, task, existingRow, now) => {
  const repeatType = String(task.repeat_type || REPEAT_TYPE.DAILY).toLowerCase();
  const progressTarget = getProgressTarget(task);
  const periodKey = getPeriodKey(repeatType, now);

  if (!shouldProvisionTask(repeatType)) {
    return existingRow || null;
  }

  if (!existingRow) {
    const [result] = await connection.execute(
      `INSERT INTO user_tasks
         (user_id, task_id, period_key, status, progress_current, progress_target, assigned_at)
       VALUES (?, ?, ?, ?, 0, ?, ?)`,
      [userId, task.task_id, periodKey, TASK_STATUS.PENDING, progressTarget, now]
    );

    return {
      id: result.insertId,
      user_id: userId,
      task_id: task.task_id,
      period_key: periodKey,
      status: TASK_STATUS.PENDING,
      progress_current: 0,
      progress_target: progressTarget,
      assigned_at: now,
      completed_at: null,
      claimed_at: null,
    };
  }

  const needsReset = repeatType !== REPEAT_TYPE.ONCE && existingRow.period_key !== periodKey;
  const needsTargetSync = Number(existingRow.progress_target || 0) !== progressTarget;
  const needsPeriodFill = !existingRow.period_key && periodKey;

  if (needsReset) {
    await refreshTaskRowForPeriod(connection, existingRow.id, periodKey, progressTarget, now);
    return {
      ...existingRow,
      period_key: periodKey,
      status: TASK_STATUS.PENDING,
      progress_current: 0,
      progress_target: progressTarget,
      assigned_at: now,
      completed_at: null,
      claimed_at: null,
    };
  }

  if (needsTargetSync || needsPeriodFill) {
    await connection.execute(
      `UPDATE user_tasks
       SET progress_target = ?,
           period_key = COALESCE(period_key, ?)
       WHERE id = ?`,
      [progressTarget, periodKey, existingRow.id]
    );
    return {
      ...existingRow,
      progress_target: progressTarget,
      period_key: existingRow.period_key || periodKey,
    };
  }

  return existingRow;
};

const getLockedUserTask = async (connection, userId, task, date = new Date()) => {
  const { repeatType, periodKey } = getTaskWindow(task, date);

  if (repeatType === REPEAT_TYPE.ONCE) {
    const [rows] = await connection.execute(
      `SELECT * FROM user_tasks
       WHERE user_id = ? AND task_id = ? AND (period_key = ? OR period_key IS NULL)
       ORDER BY assigned_at DESC, id DESC
       LIMIT 1
       FOR UPDATE`,
      [userId, task.task_id, REPEAT_TYPE.ONCE]
    );
    return rows[0] || null;
  }

  if (periodKey) {
    const [rows] = await connection.execute(
      `SELECT * FROM user_tasks
       WHERE user_id = ? AND task_id = ? AND period_key = ?
       ORDER BY assigned_at DESC, id DESC
       LIMIT 1
       FOR UPDATE`,
      [userId, task.task_id, periodKey]
    );
    return rows[0] || null;
  }

  const [rows] = await connection.execute(
    `SELECT * FROM user_tasks
     WHERE user_id = ? AND task_id = ?
     ORDER BY assigned_at DESC, id DESC
     LIMIT 1
     FOR UPDATE`,
    [userId, task.task_id]
  );
  return rows[0] || null;
};

const getAllTasks = async (userId) => {
  const cacheKey = getTaskCacheKey(userId);

  return getOrSet(cacheKey, 300, async () => {
    const db = require("../config/db");
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const levelHistoryService = require("./userLevelHistory.service");
      const currentLevelId = await levelHistoryService.ensureUserLevel(userId);

      const [taskDefs] = await connection.execute(
        "SELECT * FROM tasks WHERE level_id = ? OR level_id IS NULL",
        [currentLevelId]
      );

      if (taskDefs.length === 0) {
        await connection.commit();
        return [];
      }

      const taskIds = taskDefs.map((task) => task.task_id);
      const placeholders = taskIds.map(() => "?").join(",");
      const [existingRows] = await connection.query(
        `SELECT * FROM user_tasks WHERE user_id = ? AND task_id IN (${placeholders}) FOR UPDATE`,
        [userId, ...taskIds]
      );

      const now = new Date();
      const taskRowsMap = new Map();

      for (const row of existingRows) {
        if (!taskRowsMap.has(row.task_id)) {
          taskRowsMap.set(row.task_id, []);
        }
        taskRowsMap.get(row.task_id).push(row);
      }

      const taskStateMap = new Map();

      for (const task of taskDefs) {
        const taskRows = taskRowsMap.get(task.task_id) || [];
        const existingRow = pickTaskRowForCurrentWindow(task, taskRows, now);
        const provisionedRow = await provisionTaskRow(connection, userId, task, existingRow, now);
        if (provisionedRow) {
          taskStateMap.set(task.task_id, provisionedRow);
        } else if (existingRow) {
          taskStateMap.set(task.task_id, existingRow);
        }
      }

      await connection.commit();

      return taskDefs.map((task) => buildUserTaskPayload(task, taskStateMap.get(task.task_id) || null));
    } catch (error) {
      await connection.rollback();
      logger.warn("[Task] getAllTasks transaction rollback", { userId, error: error.message });
      throw error;
    } finally {
      connection.release();
    }
  });
};

const assignTask = async (userId, taskId) => {
  const task = await Task.getTaskById(taskId);
  if (!task) throw new Error("Nhiem vu khong ton tai");

  const levelHistoryService = require("./userLevelHistory.service");
  const currentLevelId = await levelHistoryService.ensureUserLevel(userId);

  if (task.level_id !== null && Number(currentLevelId) !== Number(task.level_id)) {
    throw new Error("Nhiem vu khong thuoc cap do hien tai cua ban");
  }

  const periodKey = getTaskWindow(task).periodKey;
  return Task.assign(userId, taskId, {
    status: TASK_STATUS.PENDING,
    periodKey,
    progressCurrent: 0,
    progressTarget: getProgressTarget(task),
  });
};

const completeTask = async (userId, taskId, options = {}) => {
  const db = require("../config/db");
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [tasks] = await connection.execute("SELECT * FROM tasks WHERE task_id = ?", [taskId]);
    if (tasks.length === 0) throw new Error("Khong tim thay nhiem vu");

    const task = tasks[0];
    const levelHistoryService = require("./userLevelHistory.service");
    const currentLevelId = await levelHistoryService.ensureUserLevel(userId);

    if (task.level_id !== null && Number(currentLevelId) !== Number(task.level_id)) {
      throw new Error("Ban chua dat cap do de thuc hien nhiem vu nay");
    }

    const now = new Date();
    let userTask = await getLockedUserTask(connection, userId, task, now);
    userTask = await provisionTaskRow(connection, userId, task, userTask, now);

    if (!userTask) {
      throw new Error("Nhiem vu nay khong ho tro hoan thanh thu cong");
    }

    if (userTask.status === TASK_STATUS.CLAIMED) {
      await connection.commit();
      return {
        status: TASK_STATUS.CLAIMED,
        progress_current: Number(userTask.progress_current || 0),
        progress_target: Number(userTask.progress_target || getProgressTarget(task)),
        pointsAwarded: Number(task.points_awarded || 0),
        claimable: false,
        alreadyClaimed: true,
        message: "Nhiem vu da duoc nhan thuong",
      };
    }

    if (userTask.status === TASK_STATUS.COMPLETED) {
      await connection.commit();
      return {
        status: TASK_STATUS.COMPLETED,
        progress_current: Number(userTask.progress_current || getProgressTarget(task)),
        progress_target: Number(userTask.progress_target || getProgressTarget(task)),
        pointsAwarded: Number(task.points_awarded || 0),
        claimable: true,
        alreadyCompleted: true,
        message: "Nhiem vu da hoan thanh, hay nhan thuong",
      };
    }

    const progressTarget = Number(userTask.progress_target || getProgressTarget(task));
    const currentProgress = Number(userTask.progress_current || 0);
    const increment = Number(options.increment || 1);
    const effectiveIncrement = increment > 0 ? increment : 1;
    const nextProgress = Math.min(progressTarget, currentProgress + effectiveIncrement);
    const nextStatus = nextProgress >= progressTarget ? TASK_STATUS.COMPLETED : TASK_STATUS.IN_PROGRESS;
    const eventType = options.eventType || null;
    const eventRef = options.eventRef || null;

    if (eventType && eventRef) {
      const recorded = await recordTaskEvent(connection, userId, taskId, userTask.id, eventType, eventRef);
      if (!recorded) {
        await connection.commit();
        return {
          status: userTask.status,
          progress_current: currentProgress,
          progress_target: progressTarget,
          pointsAwarded: 0,
          claimable: userTask.status === TASK_STATUS.COMPLETED,
          alreadyRecorded: true,
          message: "Su kien da duoc ghi nhan",
        };
      }
    }

    await connection.execute(
      `UPDATE user_tasks
       SET progress_current = ?,
           progress_target = ?,
           status = ?,
           completed_at = ?,
           source_event = COALESCE(source_event, ?),
           source_ref = COALESCE(source_ref, ?)
       WHERE id = ?`,
      [
        nextProgress,
        progressTarget,
        nextStatus,
        nextStatus === TASK_STATUS.COMPLETED ? now : null,
        eventType || task.task_type || null,
        eventRef || null,
        userTask.id,
      ]
    );

    await connection.commit();
    await invalidate(`tasks:${userId}:`);

    return {
      status: nextStatus,
      progress_current: nextProgress,
      progress_target: progressTarget,
      pointsAwarded: Number(task.points_awarded || 0),
      claimable: nextStatus === TASK_STATUS.COMPLETED,
      message:
        nextStatus === TASK_STATUS.COMPLETED
          ? "Hoan thanh nhiem vu, san sang nhan thuong"
          : "Da cap nhat tien do nhiem vu",
    };
  } catch (error) {
    await connection.rollback();
    logger.warn("[Task] completeTask transaction rollback", { userId, taskId, error: error.message });
    throw error;
  } finally {
    connection.release();
  }
};

const claimTask = async (userId, taskId) => {
  const db = require("../config/db");
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [tasks] = await connection.execute("SELECT * FROM tasks WHERE task_id = ?", [taskId]);
    if (tasks.length === 0) throw new Error("Khong tim thay nhiem vu");

    const task = tasks[0];
    const { repeatType, periodKey: currentPeriodKey } = getTaskWindow(task);
    const progressTarget = getProgressTarget(task);
    let userTask = await getLockedUserTask(connection, userId, task);

    if (!userTask) {
      throw new Error("Nhiem vu chua san sang de nhan thuong");
    }

    if (shouldProvisionTask(repeatType) && repeatType !== REPEAT_TYPE.ONCE && userTask.period_key !== currentPeriodKey) {
      await refreshTaskRowForPeriod(connection, userTask.id, currentPeriodKey, progressTarget, new Date());
      throw new Error("Nhiem vu da sang chu ky moi");
    }

    if (userTask.status === TASK_STATUS.CLAIMED) {
      throw new Error("Nhiem vu da duoc nhan thuong");
    }

    if (userTask.status !== TASK_STATUS.COMPLETED) {
      throw new Error("Nhiem vu chua hoan thanh");
    }

    const pointsReward = Number(task.points_awarded || 0);
    if (pointsReward > 0) {
      await connection.execute(
        `INSERT INTO user_points (user_id, total_exp)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE total_exp = total_exp + VALUES(total_exp)`,
        [userId, pointsReward]
      );
    }

    await connection.execute(
      "UPDATE user_tasks SET status = ?, claimed_at = NOW() WHERE id = ?",
      [TASK_STATUS.CLAIMED, userTask.id]
    );

    await connection.commit();
    await invalidate(`tasks:${userId}:`);

    return {
      status: TASK_STATUS.CLAIMED,
      pointsAwarded: pointsReward,
      message: `Nhan thuong thanh cong! +${pointsReward} EXP`,
    };
  } catch (error) {
    await connection.rollback();
    logger.warn("[Task] claimTask transaction rollback", { userId, taskId, error: error.message });
    throw error;
  } finally {
    connection.release();
  }
};

const completeTaskByName = async (userId, taskName, options = {}) => {
  const db = require("../config/db");

  try {
    const levelHistoryService = require("./userLevelHistory.service");
    const currentLevelId = await levelHistoryService.ensureUserLevel(userId);

    const [tasks] = await db.execute(
      "SELECT task_id FROM tasks WHERE task_name = ? AND (level_id = ? OR level_id IS NULL)",
      [taskName, currentLevelId]
    );

    if (tasks.length === 0) {
      logger.info("[AutoTask] task not found for user", { userId, taskName, currentLevelId });
      return null;
    }

    return completeTask(userId, tasks[0].task_id, options);
  } catch (error) {
    logger.warn("[AutoTask] completeTaskByName failed", { userId, taskName, error: error.message });
    return null;
  }
};

module.exports = {
  getAllTasks,
  assignTask,
  completeTask,
  claimTask,
  completeTaskByName,
};
