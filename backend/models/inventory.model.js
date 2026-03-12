const db = require("../config/db");
const UserPointModel = require("./userPoint.model");
const { CONSUMABLE_EFFECT } = require("../constants/inventoryContract");
const logger = require("../utils/logger");

const EQUIPPABLE_ITEM_TYPES = ["avatar_frame", "badge", "chat_color"];

const InventoryModel = {
  getUserBadges: async (userId) => {
    const [rows] = await db.query(
      `SELECT
         ui.id AS inventory_id,
         ui.reward_id,
         ui.is_equipped,
         ui.quantity,
         ui.expires_at,
         r.reward_name AS badge_name,
         COALESCE(
           r.icon,
           CASE
             WHEN lb.override_icon_url IS NOT NULL
               AND (lb.override_expires_at IS NULL OR lb.override_expires_at > UTC_TIMESTAMP())
             THEN lb.override_icon_url
             ELSE lb.icon_url
           END
         ) AS icon_url,
         COALESCE(r.code, lb.slug, CONCAT('reward-badge-', r.reward_id)) AS slug,
         CASE
           WHEN r.rarity IS NULL OR r.rarity = 'common' THEN COALESCE(lb.rarity, r.rarity, 'common')
           ELSE r.rarity
         END AS rarity,
         COALESCE(JSON_UNQUOTE(JSON_EXTRACT(r.metadata, '$.color')), lb.color, '#888888') AS color,
         COALESCE(JSON_UNQUOTE(JSON_EXTRACT(r.metadata, '$.animation_type')), lb.animation_type, 'none') AS animation_type,
         COALESCE(lb.sort_order, r.display_order, 0) AS sort_order
       FROM user_inventory ui
       JOIN rewards r ON ui.reward_id = r.reward_id
       LEFT JOIN level_badges lb
         ON lb.is_active = 1
        AND RIGHT(r.reward_name, CHAR_LENGTH(lb.badge_name)) COLLATE utf8mb4_unicode_ci
          = lb.badge_name COLLATE utf8mb4_unicode_ci
       WHERE ui.user_id = ?
         AND r.reward_type = 'badge'
         AND (ui.expires_at IS NULL OR ui.expires_at > UTC_TIMESTAMP())
       ORDER BY COALESCE(lb.sort_order, r.display_order, 0) ASC, r.reward_id ASC`,
      [userId]
    );

    return rows;
  },

  getBadgeOwnership: async (userId, rewardId) => {
    const [[row]] = await db.query(
      `SELECT ui.reward_id, r.reward_type
       FROM user_inventory ui
       JOIN rewards r ON ui.reward_id = r.reward_id
       WHERE ui.user_id = ?
         AND ui.reward_id = ?
         AND (ui.expires_at IS NULL OR ui.expires_at > UTC_TIMESTAMP())
       LIMIT 1`,
      [userId, rewardId]
    );

    return row || null;
  },

  equipBadge: async (userId, rewardId) => {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [[ownership]] = await connection.query(
        `SELECT ui.reward_id, r.reward_type, ui.is_equipped
         FROM user_inventory ui
         JOIN rewards r ON ui.reward_id = r.reward_id
         WHERE ui.user_id = ?
           AND ui.reward_id = ?
           AND (ui.expires_at IS NULL OR ui.expires_at > UTC_TIMESTAMP())
         LIMIT 1
         FOR UPDATE`,
        [userId, rewardId]
      );

      if (!ownership) {
        throw new Error("Ban khong so huu huy hieu nay.");
      }

      if (ownership.reward_type !== "badge") {
        throw new Error("Vat pham nay khong phai huy hieu.");
      }

      // Toggle off if already equipped
      if (ownership.is_equipped) {
        await connection.query(
          "UPDATE user_inventory SET is_equipped = 0 WHERE user_id = ? AND reward_id = ?",
          [userId, rewardId]
        );
        await connection.commit();
        try {
          const ChatProfileService = require("../services/chatProfile.service");
          ChatProfileService.invalidateProfile(userId).catch(() => {});
        } catch (e) {}
        return { reward_id: rewardId, equipped: false };
      }

      await connection.query(
        `UPDATE user_inventory ui
         JOIN rewards r ON ui.reward_id = r.reward_id
         SET ui.is_equipped = 0
         WHERE ui.user_id = ?
           AND r.reward_type = 'badge'`,
        [userId]
      );

      // Also unequip any shop badges
      await connection.query(
        `UPDATE user_inventory ui
         JOIN shop_items si ON ui.shop_item_id = si.id
         SET ui.is_equipped = 0
         WHERE ui.user_id = ?
           AND si.item_type = 'badge'`,
        [userId]
      );

      await connection.query(
        `UPDATE user_inventory
         SET is_equipped = 1
         WHERE user_id = ?
           AND reward_id = ?`,
        [userId, rewardId]
      );

      await connection.commit();
      try {
        const ChatProfileService = require("../services/chatProfile.service");
        ChatProfileService.invalidateProfile(userId).catch(() => {});
      } catch (e) {}
      return { reward_id: rewardId, equipped: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  getEquippedBadgesForUsers: async (userIds) => {
    if (!userIds || userIds.length === 0) return new Map();

    const placeholders = userIds.map(() => "?").join(",");
    const [rows] = await db.query(
      `SELECT ui.user_id,
              r.reward_name AS badge_name,
              COALESCE(
                r.icon,
                CASE
                  WHEN lb.override_icon_url IS NOT NULL
                    AND (lb.override_expires_at IS NULL OR lb.override_expires_at > UTC_TIMESTAMP())
                  THEN lb.override_icon_url
                  ELSE lb.icon_url
                END
              ) AS icon_url,
              COALESCE(r.code, lb.slug, CONCAT('reward-badge-', r.reward_id)) AS slug,
              CASE
                WHEN r.rarity IS NULL OR r.rarity = 'common' THEN COALESCE(lb.rarity, r.rarity, 'common')
                ELSE r.rarity
              END AS rarity,
              COALESCE(JSON_UNQUOTE(JSON_EXTRACT(r.metadata, '$.color')), lb.color, '#888888') AS color,
              COALESCE(JSON_UNQUOTE(JSON_EXTRACT(r.metadata, '$.animation_type')), lb.animation_type, 'none') AS animation_type,
              COALESCE(lb.sort_order, r.display_order, 0) AS sort_order
       FROM user_inventory ui
       JOIN rewards r ON ui.reward_id = r.reward_id
       LEFT JOIN level_badges lb
         ON lb.is_active = 1
        AND RIGHT(r.reward_name, CHAR_LENGTH(lb.badge_name)) COLLATE utf8mb4_unicode_ci
          = lb.badge_name COLLATE utf8mb4_unicode_ci
       WHERE ui.user_id IN (${placeholders})
         AND ui.is_equipped = 1
         AND r.reward_type = 'badge'
         AND (ui.expires_at IS NULL OR ui.expires_at > UTC_TIMESTAMP())`,
       userIds
    );

    const [shopRows] = await db.query(
      `SELECT ui.user_id,
              si.name AS badge_name,
              si.image_url AS icon_url,
              CONCAT('shop-badge-', si.id) AS slug,
              si.css_class AS color
       FROM user_inventory ui
       JOIN shop_items si ON ui.shop_item_id = si.id
       WHERE ui.user_id IN (${placeholders})
         AND ui.is_equipped = 1
         AND si.item_type = 'badge'
         AND (ui.expires_at IS NULL OR ui.expires_at > UTC_TIMESTAMP())`,
      userIds
    );

    const map = new Map();
    for (const row of rows) {
      map.set(row.user_id, {
        badge_name: row.badge_name,
        slug: row.slug,
        icon_url: row.icon_url,
        color: row.color,
        rarity: row.rarity,
        animation_type: row.animation_type,
        sort_order: row.sort_order,
      });
    }

    for (const row of shopRows) {
        map.set(row.user_id, {
          badge_name: row.badge_name,
          slug: row.slug,
          icon_url: row.icon_url,
          color: row.color || '#34d399',
          rarity: 'rare', // Default rarity for shop badges
          animation_type: 'none',
          sort_order: 0,
        });
    }

    return map;
  },

  getUserShopItems: async (userId, filters = {}) => {
    const { itemType = null, includeExpired = false, limit = 50, offset = 0 } = filters;
    const params = [userId];
    const conditions = ["ui.user_id = ?", "ui.shop_item_id IS NOT NULL"];

    if (itemType) {
      conditions.push("si.item_type = ?");
      params.push(itemType);
    }

    if (!includeExpired) {
      conditions.push("(ui.expires_at IS NULL OR ui.expires_at > UTC_TIMESTAMP())");
    }

    const safeLimit = Math.min(Math.max(1, Number(limit) || 50), 100);
    const safeOffset = Math.max(0, Number(offset) || 0);

    const [rows] = await db.query(
      `SELECT
         ui.id AS inventory_id,
         ui.user_id,
         ui.shop_item_id AS item_id,
         ui.reward_id,
         ui.quantity,
         ui.is_equipped,
         ui.expires_at,
         ui.acquired_from,
         ui.created_at,
         ui.updated_at,
         si.name,
         si.description,
         si.item_type,
         si.price,
         si.duration_days,
         si.image_url,
         si.css_class,
         si.status,
         CASE
           WHEN ui.expires_at IS NOT NULL AND ui.expires_at <= UTC_TIMESTAMP() THEN 1
           ELSE 0
         END AS is_expired
       FROM user_inventory ui
       JOIN shop_items si ON ui.shop_item_id = si.id
       WHERE ${conditions.join(" AND ")}
       ORDER BY ui.is_equipped DESC, ui.updated_at DESC, ui.id DESC
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, safeOffset]
    );

    const [[countRow]] = await db.query(
      `SELECT COUNT(*) AS total
       FROM user_inventory ui
       JOIN shop_items si ON ui.shop_item_id = si.id
       WHERE ${conditions.join(" AND ")}`,
      params
    );

    return { rows, total: countRow?.total ?? 0 };
  },

  getShopInventoryItem: async (userId, inventoryId, connection = db) => {
    const [[row]] = await connection.query(
      `SELECT
         ui.id AS inventory_id,
         ui.user_id,
         ui.shop_item_id AS item_id,
         ui.reward_id,
         ui.quantity,
         ui.is_equipped,
         ui.expires_at,
         ui.acquired_from,
         ui.created_at,
         ui.updated_at,
         si.name,
         si.description,
         si.item_type,
         si.price,
         si.duration_days,
         si.image_url,
         si.css_class,
         si.status
       FROM user_inventory ui
       JOIN shop_items si ON ui.shop_item_id = si.id
       WHERE ui.user_id = ?
         AND ui.id = ?
       LIMIT 1`,
      [userId, inventoryId]
    );

    return row || null;
  },

  equipShopItem: async (userId, inventoryId) => {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [[target]] = await connection.query(
        `SELECT
           ui.id AS inventory_id,
           ui.shop_item_id AS item_id,
           ui.quantity,
           ui.expires_at,
           si.name,
           si.item_type,
           si.image_url,
           si.css_class,
           si.metadata AS item_metadata
         FROM user_inventory ui
         JOIN shop_items si ON ui.shop_item_id = si.id
         WHERE ui.user_id = ?
           AND ui.id = ?
           AND ui.shop_item_id IS NOT NULL
         LIMIT 1
         FOR UPDATE`,
        [userId, inventoryId]
      );

      if (!target) {
        throw new Error("Vat pham khong ton tai trong tui do.");
      }

      if (target.expires_at && new Date(target.expires_at) <= new Date()) {
        throw new Error("Vat pham da het han su dung.");
      }

      if (target.item_type === "consumable") {
        if (target.quantity <= 0) {
          throw new Error("Vật phẩm đã hết.");
        }

        // Metadata-driven consumable effects
        let effectMessage = "Sử dụng thành công!";
        let meta = {};
        if (target.item_metadata) {
          try {
            meta = typeof target.item_metadata === "object"
              ? target.item_metadata
              : JSON.parse(String(target.item_metadata) || "{}");
          } catch {
            meta = {};
          }
        }

        const effectType = meta.effect_type;
        const effectValue = Number(meta.effect_value) || 0;

        if (effectType === CONSUMABLE_EFFECT.EXP_BOOST && effectValue > 0) {
          await UserPointModel.createOrUpdate({
            user_id: userId,
            points: effectValue,
          });
          effectMessage = `Sử dụng thành công! +${effectValue} EXP`;
        }

        // Giảm số lượng vật phẩm tiêu hao
        await connection.query(
          "UPDATE user_inventory SET quantity = quantity - 1 WHERE id = ?",
          [inventoryId]
        );

        // Auto-delete the row when quantity reaches zero
        await connection.query(
          "DELETE FROM user_inventory WHERE id = ? AND quantity <= 0",
          [inventoryId]
        );

        await connection.commit();

        logger.info(JSON.stringify({
          event: "consume",
          user_id: userId,
          inventory_id: inventoryId,
          item_id: target.item_id,
          effect_type: effectType || null,
          effect_value: effectValue || 0,
        }));

        return {
          inventory_id: target.inventory_id,
          item_id: target.item_id,
          item_type: target.item_type,
          name: target.name,
          consumed: true,
          message: effectMessage,
        };
      }

      // Toggle off if already equipped
      if (target.is_equipped) {
        await connection.query(
          "UPDATE user_inventory SET is_equipped = 0 WHERE id = ?",
          [inventoryId]
        );
        await connection.commit();
        try {
          const ChatProfileService = require("../services/chatProfile.service");
          ChatProfileService.invalidateProfile(userId).catch(() => {});
        } catch (e) {}
        return {
          inventory_id: target.inventory_id,
          item_id: target.item_id,
          item_type: target.item_type,
          name: target.name,
          equipped: false
        };
      }

      await connection.query(
        `UPDATE user_inventory ui
         JOIN shop_items si ON ui.shop_item_id = si.id
         SET ui.is_equipped = 0
         WHERE ui.user_id = ?
           AND ui.shop_item_id IS NOT NULL
           AND si.item_type = ?`,
        [userId, target.item_type]
      );

      // If equipping a badge, also unequip reward badges
      if (target.item_type === "badge") {
        await connection.query(
          `UPDATE user_inventory ui
           JOIN rewards r ON ui.reward_id = r.reward_id
           SET ui.is_equipped = 0
           WHERE ui.user_id = ?
             AND r.reward_type = 'badge'`,
          [userId]
        );
      }

      await connection.query(
        `UPDATE user_inventory
         SET is_equipped = 1
         WHERE id = ?
           AND user_id = ?`,
        [inventoryId, userId]
      );

      await connection.commit();
      try {
        const ChatProfileService = require("../services/chatProfile.service");
        ChatProfileService.invalidateProfile(userId).catch(() => {});
      } catch (e) {}

      logger.info(JSON.stringify({
        event: "equip",
        user_id: userId,
        inventory_id: inventoryId,
        item_id: target.item_id,
        item_type: target.item_type,
      }));

      return {
        inventory_id: target.inventory_id,
        item_id: target.item_id,
        item_type: target.item_type,
        name: target.name,
        image_url: target.image_url,
        css_class: target.css_class,
        equipped: true
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  getEquippedAvatarFramesForUsers: async (userIds) => {
    if (!userIds || userIds.length === 0) return new Map();

    const placeholders = userIds.map(() => "?").join(",");
    const [rows] = await db.query(
      `SELECT
         ui.user_id,
         ui.id AS inventory_id,
         si.id AS item_id,
         si.name,
         si.description,
         si.image_url,
         si.css_class
       FROM user_inventory ui
       JOIN shop_items si ON ui.shop_item_id = si.id
       WHERE ui.user_id IN (${placeholders})
         AND ui.shop_item_id IS NOT NULL
         AND ui.is_equipped = 1
         AND si.item_type = 'avatar_frame'
         AND (ui.expires_at IS NULL OR ui.expires_at > UTC_TIMESTAMP())`,
      userIds
    );

    const map = new Map();
    for (const row of rows) {
      map.set(row.user_id, {
        inventory_id: row.inventory_id,
        item_id: row.item_id,
        name: row.name,
        description: row.description,
        image_url: row.image_url,
        css_class: row.css_class,
      });
    }

    return map;
  },

  getEquippedChatColorsForUsers: async (userIds) => {
    if (!userIds || userIds.length === 0) return new Map();

    const placeholders = userIds.map(() => "?").join(",");
    const [rows] = await db.query(
      `SELECT
         ui.user_id,
         ui.id AS inventory_id,
         si.id AS item_id,
         si.name,
         si.description,
         si.image_url,
         si.css_class
       FROM user_inventory ui
       JOIN shop_items si ON ui.shop_item_id = si.id
       WHERE ui.user_id IN (${placeholders})
         AND ui.shop_item_id IS NOT NULL
         AND ui.is_equipped = 1
         AND si.item_type = 'chat_color'
         AND (ui.expires_at IS NULL OR ui.expires_at > UTC_TIMESTAMP())`,
      userIds
    );

    const map = new Map();
    for (const row of rows) {
      map.set(row.user_id, {
        inventory_id: row.inventory_id,
        item_id: row.item_id,
        name: row.name,
        description: row.description,
        image_url: row.image_url,
        css_class: row.css_class,
      });
    }

    return map;
  },
};

module.exports = InventoryModel;
