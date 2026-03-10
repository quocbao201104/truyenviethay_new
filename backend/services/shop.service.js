const db = require("../config/db");
const UserCurrency = require("../models/userCurrency.model");
const InventoryModel = require("../models/inventory.model");
const ShopItemModel = require("../models/shopItem.model");
const ShopTransactionModel = require("../models/shopTransaction.model");

const PERMANENT_SINGLE_OWNERSHIP_TYPES = new Set(["avatar_frame", "badge", "chat_color"]);

function toMysqlDateTime(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function buildExpiryDate(currentExpiresAt, durationDays, multiplier = 1) {
  if (!durationDays || durationDays <= 0) return null;

  const now = new Date();
  const currentExpiry = currentExpiresAt ? new Date(currentExpiresAt) : null;
  const baseDate = currentExpiry && currentExpiry > now ? currentExpiry : now;
  const next = new Date(baseDate);
  next.setUTCDate(next.getUTCDate() + (durationDays * multiplier));
  return toMysqlDateTime(next);
}

function normalizeWriteError(error) {
  if (error?.code === "ER_BAD_NULL_ERROR" && String(error.message || "").includes("reward_id")) {
    return new Error("DB hien tai van dang bat buoc reward_id khac NULL. Can ALTER reward_id cho phep NULL truoc khi luu item shop bang shop_item_id.");
  }

  return error;
}

const ShopService = {
  getCatalog: async (filters = {}) => {
    return ShopItemModel.getCatalog({
      itemType: filters.itemType || null,
      includeHidden: false,
      onlyPurchasable: false,
    });
  },

  getUserTransactions: async (userId, limit = 20) => {
    return ShopTransactionModel.getUserTransactions(userId, limit);
  },

  getUserInventory: async (userId, filters = {}) => {
    return InventoryModel.getUserShopItems(userId, {
      itemType: filters.itemType || null,
      includeExpired: filters.includeExpired === true,
    });
  },

  buyItem: async ({ userId, itemId, quantity = 1 }) => {
    const parsedItemId = Number(itemId);
    const parsedQuantity = Number(quantity) || 1;

    if (!Number.isInteger(parsedItemId) || parsedItemId <= 0) {
      throw new Error("itemId khong hop le.");
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      throw new Error("quantity khong hop le.");
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const item = await ShopItemModel.findById(parsedItemId, connection, { forUpdate: true });
      if (!item) {
        throw new Error("Vat pham khong ton tai.");
      }

      if (item.status !== "active") {
        throw new Error("Vat pham nay tam thoi khong mo ban.");
      }

      if (!item.price || item.price <= 0) {
        throw new Error("Vat pham nay khong the mua truc tiep trong shop.");
      }

      if (item.item_type !== "consumable" && parsedQuantity !== 1) {
        throw new Error("Chi vat pham tieu hao moi duoc mua nhieu hon 1 lan.");
      }

      // Check for ownership of permanent items (covers both shop-bought and earned rewards)
      if (
        PERMANENT_SINGLE_OWNERSHIP_TYPES.has(item.item_type) &&
        (!item.duration_days || item.duration_days <= 0)
      ) {
        const [[existingOwnership]] = await connection.query(
          `SELECT ui.id
           FROM user_inventory ui
           LEFT JOIN shop_items si ON ui.shop_item_id = si.id
           LEFT JOIN rewards r ON ui.reward_id = r.reward_id
           WHERE ui.user_id = ?
             AND (
               ui.shop_item_id = ? 
               OR si.name = ? 
               OR r.reward_name = ?
             )
           LIMIT 1
           FOR UPDATE`,
          [userId, parsedItemId, item.name, item.name]
        );

        if (existingOwnership) {
          throw new Error("Ban da so huu vat pham vinh vien nay roi.");
        }
      }

      const totalPrice = item.price * parsedQuantity;
      await UserCurrency.deduct(userId, totalPrice, connection);

      const [[existingInventory]] = await connection.query(
        `SELECT id, quantity, is_equipped, expires_at
         FROM user_inventory
         WHERE user_id = ?
           AND shop_item_id = ?
         LIMIT 1
         FOR UPDATE`,
        [userId, parsedItemId]
      );

      let inventoryId = existingInventory?.id || null;
      const nextExpiresAt = buildExpiryDate(existingInventory?.expires_at, item.duration_days, parsedQuantity);

      if (!existingInventory) {
        const initialQuantity = item.item_type === "consumable" ? parsedQuantity : 1;
        const [insertResult] = await connection.query(
          `INSERT INTO user_inventory (user_id, reward_id, shop_item_id, quantity, is_equipped, expires_at, acquired_from)
           VALUES (?, NULL, ?, ?, 0, ?, 'shop_buy')`,
          [userId, parsedItemId, initialQuantity, nextExpiresAt]
        );
        inventoryId = insertResult.insertId;
      } else if (item.item_type === "consumable") {
        await connection.query(
          `UPDATE user_inventory
           SET quantity = quantity + ?,
               expires_at = COALESCE(?, expires_at),
               acquired_from = 'shop_buy'
           WHERE id = ?`,
          [parsedQuantity, nextExpiresAt, existingInventory.id]
        );
      } else {
        await connection.query(
          `UPDATE user_inventory
           SET quantity = GREATEST(quantity, 1),
               expires_at = ?,
               acquired_from = 'shop_buy'
           WHERE id = ?`,
          [nextExpiresAt, existingInventory.id]
        );
      }

      const transactionId = await ShopTransactionModel.create(
        {
          userId,
          itemId: parsedItemId,
          amountPaid: totalPrice,
          transactionType: "buy_item",
        },
        connection
      );

      const inventoryItem = await InventoryModel.getShopInventoryItem(userId, inventoryId, connection);
      const [balanceRows] = await connection.query(
        `SELECT linh_thach FROM users_new WHERE id = ? LIMIT 1`,
        [userId]
      );

      await connection.commit();

      return {
        transaction_id: transactionId,
        item: inventoryItem,
        amount_paid: totalPrice,
        remaining_linh_thach: balanceRows[0]?.linh_thach ?? null,
      };
    } catch (error) {
      await connection.rollback();
      throw normalizeWriteError(error);
    } finally {
      connection.release();
    }
  },

  equipInventoryItem: async ({ userId, inventoryId }) => {
    const parsedInventoryId = Number(inventoryId);

    if (!Number.isInteger(parsedInventoryId) || parsedInventoryId <= 0) {
      throw new Error("inventoryId khong hop le.");
    }

    return InventoryModel.equipShopItem(userId, parsedInventoryId);
  },
};

module.exports = ShopService;

