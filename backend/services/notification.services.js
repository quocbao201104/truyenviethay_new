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
 * Core notification sender with idempotency check
 * @param {number} user_id
 * @param {string} content - Notification text
 * @param {number} type - Constants from notification.constants.js
 * @param {number|null} target_id - truyen_id or chapter_id for deep linking
 */
const sendNotification = async (user_id, content, type = NOTIFY_TYPES.GIFT_LINH_THACH, target_id = null) => {
  try {
    const safeContent = sanitizeText(content);
    
    // Idempotency check to avoid duplicates (e.g. multiple clicks, retries, fanout overlap)
    // Key: user + type + target + first 50 chars of content
    const idempotencyKey = `notif_idemp:${user_id}:${type}:${target_id || 0}:${Buffer.from(safeContent.substring(0, 50)).toString('hex')}`;
    const exists = await redis.get(idempotencyKey);
    if (exists) {
      logger.debug(`Duplicate notification suppressed: ${idempotencyKey}`);
      return null;
    }
    // Set idempotency key for 60 seconds
    await redis.set(idempotencyKey, "1", "EX", 60);

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
      if (io) {
        io.to(`user_notification_${user_id}`).emit("new_notification", notificationData);
      }
    } catch (socketError) {
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
 * Batching: Push a large notification task into Redis queue with Correlation ID
 */
const pushNotifyToQueue = async (userIds, content, targetId, type) => {
  if (!userIds || userIds.length === 0) return;
  
  const correlationId = `notif_job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const job = {
    correlationId,
    userIds,
    content,
    targetId,
    type,
    queuedAt: Date.now()
  };
  
  try {
    await redis.rpush("notification_queue", JSON.stringify(job));
    logger.info(`Notification job pushed [CID:${correlationId}] for ${userIds.length} users.`);
  } catch (err) {
    logger.error(`Error pushing notification to queue [CID:${correlationId}]:`, err);
  }
};

/**
 * Bulk notification sender for fanout optimization
 */
const sendBatchNotifications = async (userIds, content, type, targetId, correlationId = null) => {
  if (!userIds || userIds.length === 0) return [];
  
  try {
    const safeContent = sanitizeText(content);
    const values = userIds.map(userId => [userId, safeContent, 0, type, targetId]);
    
    const query = `
      INSERT INTO thong_bao (user_id, content, is_read, type, target_id)
      VALUES ?
    `;
    
    const [result] = await db.query(query, [values]);
    
    // Broadcast via Socket.io in batch
    try {
      const io = getIO();
      if (io) {
        userIds.forEach(userId => {
          io.to(`user_notification_${userId}`).emit("new_notification", {
            id: result.insertId,
            user_id: userId,
            content: safeContent,
            type,
            target_id: targetId,
            is_read: 0,
            created_at: new Date()
          });
        });
      }
    } catch (socketError) {
      logger.error(`Socket broadcast failed [CID:${correlationId || 'N/A'}]:`, socketError);
    }

    return result;
  } catch (error) {
    logger.error(`Error in sendBatchNotifications [CID:${correlationId || 'N/A'}]:`, error);
    throw error;
  }
};

/**
 * Background Worker: Processes the notification queue with Observability
 */
const startNotificationWorker = async () => {
  logger.info("Notification Worker started (Observability Enabled).");
  
  const workerRedis = redis.createRedisClient({ 
    commandTimeout: null,
    maxRetriesPerRequest: null
  });

  let consecutiveErrors = 0;
  const ERROR_ALERT_THRESHOLD = 5;

  while (true) {
    try {
      // 1. Queue Lag Metric
      const lag = await redis.llen("notification_queue");
      if (lag > 100) {
        logger.warn(`ALERT: Notification queue lag detected! Size: ${lag}`);
      }

      const data = await workerRedis.blpop("notification_queue", 10); // Wait up to 10s
      if (!data) continue;
      
      const startTime = Date.now();
      const job = JSON.parse(data[1]);
      const cid = job.correlationId || "legacy";
      
      logger.info(`Processing job [CID:${cid}] for ${job.userIds.length} users.`);
      
      const batchSize = 100;
      let processed = 0;

      for (let i = 0; i < job.userIds.length; i += batchSize) {
        const batch = job.userIds.slice(i, i + batchSize);
        await sendBatchNotifications(batch, job.content, job.type, job.targetId, cid);
        processed += batch.length;
        
        if (i + batchSize < job.userIds.length) {
          await new Promise(res => setTimeout(res, 200));
        }
      }

      const duration = (Date.now() - startTime) / 1000;
      const throughput = processed / (duration || 0.1);
      
      // 2. Throughput Metric
      logger.info(`Job Finished [CID:${cid}]: ${processed} sent in ${duration.toFixed(2)}s (${throughput.toFixed(1)} notif/s).`);
      
      consecutiveErrors = 0; // Reset errors on success
    } catch (err) {
      consecutiveErrors++;
      logger.error(`Notification Worker error (Total: ${consecutiveErrors}):`, err);
      
      // 3. Reliability Alert
      if (consecutiveErrors >= ERROR_ALERT_THRESHOLD) {
        logger.error(`CRITICAL ALERT: Notification worker failing repeatedly! Threshold: ${ERROR_ALERT_THRESHOLD}`);
      }
      
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

/**
 * Gửi thông báo cho followers KHI CHƯƠNG ĐƯỢC DUYỆT.
 * Khi reject: chỉ gửi cho tác giả (đã xử lý ở chapter.services), không fanout followers.
 */
const notifyFollowersAboutChapterUpdate = async (storyId, tenTruyen, chapterId) => {
  try {
    const followers = await storyModel.getFollowers(storyId);
    if (!followers || followers.length === 0) return;

    const content = NOTIF_TEMPLATE.NEW_CHAPTER(tenTruyen);
    await pushNotifyToQueue(
      followers.map(f => f.user_id),
      content,
      chapterId,
      NOTIFY_TYPES.NEW_CHAPTER
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
