const db = require("../config/db");

const ShopTransactionModel = {
  create: async ({ userId, itemId, amountPaid, transactionType = "buy_item" }, connection = db) => {
    const [result] = await connection.query(
      `INSERT INTO shop_transactions (user_id, item_id, amount_paid, transaction_type)
       VALUES (?, ?, ?, ?)`,
      [userId, itemId, amountPaid, transactionType]
    );

    return result.insertId;
  },

  getUserTransactions: async (userId, limit = 20, connection = db) => {
    const [rows] = await connection.query(
      `SELECT st.id, st.user_id, st.item_id, st.amount_paid, st.transaction_type, st.created_at,
              si.name, si.item_type, si.image_url, si.css_class
       FROM shop_transactions st
       JOIN shop_items si ON st.item_id = si.id
       WHERE st.user_id = ?
       ORDER BY st.id DESC
       LIMIT ?`,
      [userId, Number(limit)]
    );

    return rows;
  },
};

module.exports = ShopTransactionModel;

