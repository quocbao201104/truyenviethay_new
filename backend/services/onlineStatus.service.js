const redis = require("../utils/redis");
const logger = require("../utils/logger");

const REDIS_ONLINE_USERS_KEY = "online_users";
const REDIS_TOTAL_SESSIONS_KEY = "total_sessions";
const REDIS_WORLD_GUESTS_KEY = "world_chat_guests"; // specifically for guests

const OnlineStatusService = {
  /**
   * Add user to online set
   */
  userConnected: async (userId) => {
    if (!userId) return;
    try {
      await redis.sadd(REDIS_ONLINE_USERS_KEY, userId);
      // logger.info(`User ${userId} is now online`);
    } catch (err) {
      logger.error("Error in userConnected:", err);
    }
  },

  /**
   * Remove user from online set
   */
  userDisconnected: async (userId) => {
    if (!userId) return;
    try {
      await redis.srem(REDIS_ONLINE_USERS_KEY, userId);
      // logger.info(`User ${userId} is now offline`);
    } catch (err) {
      logger.error("Error in userDisconnected:", err);
    }
  },

  /**
   * Check if a user is online
   */
  isOnline: async (userId) => {
    try {
      return await redis.sismember(REDIS_ONLINE_USERS_KEY, userId) === 1;
    } catch (err) {
      logger.error("Error in isOnline:", err);
      return false;
    }
  },

  /**
   * Get total online count
   */
  getOnlineCount: async () => {
    try {
      return await redis.scard(REDIS_ONLINE_USERS_KEY);
    } catch (err) {
      logger.error("Error in getOnlineCount:", err);
      return 0;
    }
  },

  /**
   * Get all online user IDs
   */
  getOnlineUserIds: async () => {
    try {
      return await redis.smembers(REDIS_ONLINE_USERS_KEY);
    } catch (err) {
      logger.error("Error in getOnlineUserIds:", err);
      return [];
    }
  },
  /**
   * Track every single socket connection (including guests)
   */
  sessionConnected: async (socketId) => {
    try {
      await redis.sadd(REDIS_TOTAL_SESSIONS_KEY, socketId);
    } catch (err) {
      logger.error("Error in sessionConnected:", err);
    }
  },
  sessionDisconnected: async (socketId) => {
    try {
      await redis.srem(REDIS_TOTAL_SESSIONS_KEY, socketId);
      await redis.srem(REDIS_WORLD_GUESTS_KEY, socketId); // Cleanup if they were in world chat
    } catch (err) {
      logger.error("Error in sessionDisconnected:", err);
    }
  },

  /**
   * Track only guests in world chat
   */
  worldGuestJoined: async (socketId) => {
    try {
      await redis.sadd(REDIS_WORLD_GUESTS_KEY, socketId);
    } catch (err) {
      logger.error("Error in worldGuestJoined:", err);
    }
  },

  worldGuestLeft: async (socketId) => {
    try {
      await redis.srem(REDIS_WORLD_GUESTS_KEY, socketId);
    } catch (err) {
      logger.error("Error in worldGuestLeft:", err);
    }
  },

  getWorldOnlineCount: async () => {
    try {
      const loggedInCount = await redis.scard(REDIS_ONLINE_USERS_KEY);
      const guestWorldCount = await redis.scard(REDIS_WORLD_GUESTS_KEY);
      return loggedInCount + guestWorldCount;
    } catch (err) {
      logger.error("Error in getWorldOnlineCount:", err);
      return 0;
    }
  },

  getTotalOnlineCount: async () => {
    try {
      return await redis.scard(REDIS_TOTAL_SESSIONS_KEY);
    } catch (err) {
      logger.error("Error in getTotalOnlineCount:", err);
      return 0;
    }
  }
};

module.exports = OnlineStatusService;
