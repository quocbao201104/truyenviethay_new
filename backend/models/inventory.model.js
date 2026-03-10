const db = require("../config/db");
const UserPointModel = require("./userPoint.model");

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
         lb.badge_name,
         lb.icon_url,
         lb.color
       FROM user_inventory ui
       JOIN rewards r ON ui.reward_id = r.reward_id
       JOIN level_badges lb ON r.reward_id = lb.reward_id
       WHERE ui.user_id = ?
         AND r.reward_type = 'badge'
         AND (ui.expires_at IS NULL OR ui.expires_at > UTC_TIMESTAMP())
       ORDER BY lb.id ASC`,
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
        `SELECT ui.reward_id, r.reward_type
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

      await connection.query(
        `UPDATE user_inventory ui
         JOIN rewards r ON ui.reward_id = r.reward_id
         SET ui.is_equipped = 0
         WHERE ui.user_id = ?
           AND r.reward_type = 'badge'`,
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
      return { reward_id: rewardId };
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
      `SELECT ui.user_id, lb.badge_name, lb.icon_url, lb.color, r.rarity
       FROM user_inventory ui
       JOIN rewards r ON ui.reward_id = r.reward_id
       JOIN level_badges lb ON r.reward_id = lb.reward_id
       WHERE ui.user_id IN (${placeholders})
         AND ui.is_equipped = 1
         AND r.reward_type = 'badge'
         AND (ui.expires_at IS NULL OR ui.expires_at > UTC_TIMESTAMP())`,
      userIds
    );

    const map = new Map();
    for (const row of rows) {
      map.set(row.user_id, {
        badge_name: row.badge_name,
        icon_url: row.icon_url,
        color: row.color,
        rarity: row.rarity,
      });
    }

    return map;
  },

  getUserShopItems: async (userId, filters = {}) => {
    const { itemType = null, includeExpired = false } = filters;
    const params = [userId];
    const conditions = ["ui.user_id = ?", "ui.shop_item_id IS NOT NULL"];

    if (itemType) {
      conditions.push("si.item_type = ?");
      params.push(itemType);
    }

    if (!includeExpired) {
      conditions.push("(ui.expires_at IS NULL OR ui.expires_at > UTC_TIMESTAMP())");
    }

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
       ORDER BY ui.is_equipped DESC, ui.updated_at DESC, ui.id DESC`,
      params
    );

    return rows;
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
           si.css_class
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

        // Đặc biệt: Shop Item ID 8 cộng 1000 EXP
        if (target.item_id === 8) {
          await UserPointModel.createOrUpdate({
            user_id: userId,
            points: 1000,
          });
        }

        // Giảm số lượng vật phẩm tiêu hao
        await connection.query(
          "UPDATE user_inventory SET quantity = quantity - 1 WHERE id = ?",
          [inventoryId]
        );

        await connection.commit();

        return {
          inventory_id: target.inventory_id,
          item_id: target.item_id,
          item_type: target.item_type,
          name: target.name,
          consumed: true,
          message: target.item_id === 8 ? "Sử dụng thành công! +1000 EXP" : "Sử dụng thành công!",
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

      await connection.query(
        `UPDATE user_inventory
         SET is_equipped = 1
         WHERE id = ?
           AND user_id = ?`,
        [inventoryId, userId]
      );

      await connection.commit();

      return {
        inventory_id: target.inventory_id,
        item_id: target.item_id,
        item_type: target.item_type,
        name: target.name,
        image_url: target.image_url,
        css_class: target.css_class,
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
};

module.exports = InventoryModel;

