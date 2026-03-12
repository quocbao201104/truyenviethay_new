const db = require("../config/db");

const ShopItemModel = {
  getCatalog: async (filters = {}, connection = db) => {
    const { itemType = null, includeHidden = false, onlyPurchasable = false } = filters;
    const params = [];
    const conditions = [];

    if (!includeHidden) {
      conditions.push("status = 'active'");
    }

    if (itemType) {
      conditions.push("item_type = ?");
      params.push(itemType);
    }

    if (onlyPurchasable) {
      conditions.push("price > 0");
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await connection.query(
      `SELECT id, name, description, item_type, price, duration_days, image_url, css_class, status, metadata, created_at
       FROM shop_items
       ${whereClause}
       ORDER BY price ASC, id ASC`,
      params
    );

    return rows;
  },

  findById: async (itemId, connection = db, { forUpdate = false } = {}) => {
    const [rows] = await connection.query(
      `SELECT id, name, description, item_type, price, duration_days, image_url, css_class, status, metadata, created_at
       FROM shop_items
       WHERE id = ?
       LIMIT 1 ${forUpdate ? "FOR UPDATE" : ""}`,
      [itemId]
    );

    return rows[0] || null;
  },
};

module.exports = ShopItemModel;

