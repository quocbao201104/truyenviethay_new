/**
 * Inventory System Contract
 * acquired_from / source_type cho user_inventory - nguồn cấp vật phẩm
 */

/** user_inventory.acquired_from: nguồn vật phẩm trong túi đồ */
const INVENTORY_SOURCE = Object.freeze({
  SHOP: "shop_buy",
  REWARD: "reward",
  MAIL: "mail",
  SYSTEM: "system",
});

/** Consumable effect types - đọc từ shop_items.metadata */
const CONSUMABLE_EFFECT = Object.freeze({
  EXP_BOOST: "exp_boost",
  CURRENCY: "currency",
  // Mở rộng: buff, badge_unlock, event_ticket, ...
});

module.exports = {
  INVENTORY_SOURCE,
  CONSUMABLE_EFFECT,
};
