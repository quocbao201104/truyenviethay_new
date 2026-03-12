const redis = require("../utils/redis");
const logger = require("../utils/logger");
const InventoryModel = require("../models/inventory.model");
const UserLevelHistory = require("../models/userLevelHistory.model");
const UserLevel = require("../models/userLevels.model");

const REDIS_CHAT_PROFILE_PREFIX = "chat:profile:";
const PROFILE_TTL_SECONDS = 300; // 5 minutes

const ChatProfileService = {
  /**
   * Get cached chat profile for a user (frame, badge, chat color, level).
   * Falls back to DB if cache miss, then stores result in Redis.
   */
  getProfile: async (userId) => {
    if (!userId) return null;
    const key = `${REDIS_CHAT_PROFILE_PREFIX}${userId}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          logger.warn("Invalid chat_profile cache JSON, rebuilding", { userId });
        }
      }
    } catch (err) {
      logger.error("Redis error reading chat_profile:", err);
    }

    try {
      const [
        levelId,
        frameMap,
        colorMap,
        badgeMap,
      ] = await Promise.all([
        UserLevelHistory.getCurrentLevelOfUser(userId),
        InventoryModel.getEquippedAvatarFramesForUsers([userId]),
        InventoryModel.getEquippedChatColorsForUsers([userId]),
        InventoryModel.getEquippedBadgesForUsers([userId]),
      ]);

      let level = null;
      if (levelId) {
        try {
          const levelRow = await UserLevel.getById(levelId);
          if (levelRow) {
            level = {
              id: levelRow.level_id,
              name: levelRow.name || null,
              type: levelRow.type || null,
            };
          } else {
            level = { id: levelId, name: null, type: null };
          }
        } catch (e) {
          logger.warn("Failed to load level definition for chat_profile", { userId, levelId, error: e.message });
          level = { id: levelId, name: null, type: null };
        }
      }

      const frame = frameMap.get(userId) || null;
      const chatColor = colorMap.get(userId) || null;
      const badge = badgeMap.get(userId) || null;

      const profile = {
        userId,
        level,
        equipped_frame: frame,
        equipped_chat_color: chatColor,
        badge,
      };

      try {
        await redis.set(key, JSON.stringify(profile), "EX", PROFILE_TTL_SECONDS);
      } catch (e) {
        logger.error("Failed to cache chat_profile:", e);
      }

      return profile;
    } catch (err) {
      logger.error("Failed to build chat_profile:", err);
      return null;
    }
  },

  /**
   * Invalidate cached chat profile (call when user changes level / frame / badge / chat color).
   */
  invalidateProfile: async (userId) => {
    if (!userId) return;
    const key = `${REDIS_CHAT_PROFILE_PREFIX}${userId}`;
    try {
      await redis.del(key);
    } catch (err) {
      logger.error("Failed to invalidate chat_profile cache:", err);
    }
  },
};

module.exports = ChatProfileService;

