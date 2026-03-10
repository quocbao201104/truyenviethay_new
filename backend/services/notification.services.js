const db = require("../config/db");
const storyModel = require("../models/story.model");
const { sanitizeText } = require("../utils/sanitize");
const { getIO } = require("../config/socket");
const logger = require("../utils/logger");
const redis = require("../utils/redis");
const { NOTIFY_TYPES } = require("../constants/notification.constants");

// ===== Notification Templates =====
const NOTIF_TEMPLATE = {
  NEW_CHAPTER: (storyName) => `${storyName} đã có chương mới.`,
  CHAPTER_REJECTED: (storyName) => `Chương mới trong truyện ${storyName} đã bị từ chối.`,
  CHAPTER_APPROVED_AUTHOR: (storyName) => `Chương của bạn trong truyện ${storyName} đã được duyệt thành công.`,
  CHAPTER_REJECTED_AUTHOR: (storyName) => `Chương của bạn trong truyện ${storyName} đã bị từ chối.`,
  STORY_APPROVED: (storyName) => `Truyện ${storyName} của bạn đã được duyệt.`,
  STORY_REJECTED: (storyName) => `Truyện ${storyName} của bạn đã bị từ chối.`,
  STORY_PENDING_REVIEW: (storyName, author) => `Truyện "${storyName}" của tác giả ${author} cần được kiểm duyệt.`,
};

/**
 * Core notification sender
 * @param {number} user_id
 * @param {string} content - Notification text
 * @param {number} type - Constants from notification.constants.js
 * @param {number|null} target_id - truyen_id or chapter_id for deep linking
 */
const sendNotification = async (user_id, content, type = NOTIFY_TYPES.GIFT_LINH_THACH, target_id = null) => {
  try {
    const safeContent = sanitizeText(content);
    const query = `
      INSERT INTO thong_bao (user_id, content, is_read, type, target_id)
      VALUES (?, ?, 0, ?, ?)
    `;
    const [result] = await db.query(query, [user_id, safeContent, type, target_id]);

    const notificationData = {
      id: result.insertId,
      user_id,
      content: safeContent,
      type,
      target_id,
      is_read: 0,
      created_at: new Date()
    };

    // Broadcast via Socket.io
    try {
      const io = getIO();
      io.to(`user_notification_${user_id}`).emit("new_notification", notificationData);
    } catch (socketError) {
      // Don't fail the whole request if socket fails
      logger.error("Socket broadcast failed in sendNotification:", socketError);
    }

    return notificationData;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw new Error("Có lỗi xảy ra khi gửi thông báo.");
  }
};

/**
 * Send system-wide notification to all online users
 */
const sendSystemNotice = async (content) => {
  try {
    const io = getIO();
    io.emit("system_notification", {
      content,
      type: 'system',
      created_at: new Date()
    });
    logger.info("System notification broadcasted.");
  } catch (err) {
    logger.error("NotificationService.sendSystemNotice error:", err);
  }
};

/**
 * Batching: Push a large notification task into Redis queue
 */
const pushNotifyToQueue = async (userIds, content, targetId, type) => {
  if (!userIds || userIds.length === 0) return;
  
  const job = {
    userIds,
    content,
    targetId,
    type
  };
  
  try {
    await redis.rpush("notification_queue", JSON.stringify(job));
    logger.info(`Notification job pushed to queue for ${userIds.length} users.`);
  } catch (err) {
    logger.error("Error pushing notification to queue:", err);
  }
};

/**
 * Background Worker: Processes the notification queue in batches
 */
const startNotificationWorker = async () => {
  logger.info("Notification Worker started.");
  
  // Use a dedicated client for blocking operations (infinite timeout)
  const workerRedis = redis.createRedisClient({ 
    commandTimeout: null, // No timeout for blocking ops
    maxRetriesPerRequest: null // Required by ioredis for blocking commands
  });

  workerRedis.on('error', (err) => {
    logger.error("Notification Worker Redis Client error:", err);
  });

  while (true) {
    try {
      // Blocking pop from the right side of the list (0 = wait forever)
      const data = await workerRedis.blpop("notification_queue", 0);
      if (!data) continue;
      
      const job = JSON.parse(data[1]);
      logger.info(`Processing notification job for ${job.userIds.length} users.`);
      
      const batchSize = 50;
      for (let i = 0; i < job.userIds.length; i += batchSize) {
        const batch = job.userIds.slice(i, i + batchSize);
        
        // Process each user in the current batch
        await Promise.all(batch.map(userId => 
          sendNotification(userId, job.content, job.type, job.targetId)
        ));
        
        // Brief sleep to avoid congestion
        if (i + batchSize < job.userIds.length) {
          await new Promise(res => setTimeout(res, 300));
        }
      }
      logger.info(`Finished processing job for ${job.userIds.length} users.`);
    } catch (err) {
      logger.error("Notification Worker error:", err);
      // Wait a bit before retrying a failed job
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

// Gửi thông báo cho người theo dõi khi có chương mới hoặc bị từ chối
const notifyFollowersAboutChapterUpdate = async (storyId, tenTruyen, action, targetId = null) => {
  try {
    const followers = await storyModel.getFollowers(storyId);
    if (!followers || followers.length === 0) return;
    
    const content = action === "duyet"
      ? NOTIF_TEMPLATE.NEW_CHAPTER(tenTruyen)
      : NOTIF_TEMPLATE.CHAPTER_REJECTED(tenTruyen);

    const type = action === "duyet" ? NOTIFY_TYPES.NEW_CHAPTER : NOTIFY_TYPES.NEW_CHAPTER; 

    // Use Queue for followers (potentially large list)
    await pushNotifyToQueue(
      followers.map(f => f.user_id),
      content,
      targetId || storyId,
      type
    );
  } catch (error) {
    console.error("Error notifying followers:", error);
    throw new Error("Có lỗi xảy ra khi thông báo cho người theo dõi.");
  }
};

// Gửi thông báo cho tất cả admin
const sendNotificationToAdmins = async (content, type = NOTIFY_TYPES.BOOK_APPROVED, target_id = null) => {
  try {
    const [admins] = await db.query(
      "SELECT id FROM users_new WHERE role = 'admin'"
    );

    await Promise.all(
      admins.map((admin) => sendNotification(admin.id, content, type, target_id))
    );
  } catch (error) {
    console.error("Error sending notification to admins:", error);
    throw new Error("Không thể gửi thông báo cho admin.");
  }
};

// Gửi thông báo cho tác giả khi truyện được duyệt hoặc từ chối
const notifyAuthorAboutStoryApproval = async (userId, storyId, tenTruyen, action) => {
  try {
    const content = action === "duyet"
      ? NOTIF_TEMPLATE.STORY_APPROVED(tenTruyen)
      : NOTIF_TEMPLATE.STORY_REJECTED(tenTruyen);

    await sendNotification(userId, content, NOTIFY_TYPES.BOOK_APPROVED, storyId);
  } catch (error) {
    console.error("Error notifying author:", error);
    throw new Error("Có lỗi xảy ra khi gửi thông báo cho tác giả.");
  }
};

module.exports = {
  sendNotification,
  sendSystemNotice,
  pushNotifyToQueue,
  startNotificationWorker,
  notifyFollowersAboutChapterUpdate,
  notifyAuthorAboutStoryApproval,
  sendNotificationToAdmins,
  NOTIFY_TYPES,
  NOTIF_TEMPLATE,
};
