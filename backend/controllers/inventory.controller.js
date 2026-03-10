const InventoryModel = require("../models/inventory.model");
const ShopService = require("../services/shop.service");

function getStatusFromMessage(message) {
  const businessErrors = [
    "Ban khong so huu huy hieu nay.",
    "Vat pham nay khong phai huy hieu.",
    "inventoryId khong hop le.",
    "Vat pham khong ton tai trong tui do.",
    "Vat pham da het han su dung.",
    "Vat pham nay khong the trang bi.",
  ];

  return businessErrors.includes(message) ? 400 : 500;
}

exports.getUserBadges = async (req, res) => {
  try {
    const userId = req.user.id;
    const badges = await InventoryModel.getUserBadges(userId);
    res.json({ success: true, data: badges });
  } catch (error) {
    console.error("Inventory badges error:", error.message);
    res.status(500).json({ success: false, message: "Khong the lay danh sach huy hieu." });
  }
};

exports.equipBadge = async (req, res) => {
  try {
    const userId = req.user.id;
    const rewardId = Number(req.body.rewardId);

    if (!rewardId || Number.isNaN(rewardId)) {
      return res.status(400).json({ success: false, message: "rewardId khong hop le." });
    }

    const result = await InventoryModel.equipBadge(userId, rewardId);

    res.json({
      success: true,
      message: "Deo huy hieu thanh cong.",
      data: result,
    });
  } catch (error) {
    const status = getStatusFromMessage(error.message);
    console.error("Inventory equip badge error:", error.message);
    res.status(status).json({ success: false, message: error.message });
  }
};

exports.getMyShopInventory = async (req, res) => {
  try {
    const rows = await ShopService.getUserInventory(req.user.id, {
      itemType: req.query.itemType || null,
      includeExpired: req.query.includeExpired === "true",
    });

    const equippedFrame = rows.find((item) => item.item_type === "avatar_frame" && item.is_equipped) || null;

    res.json({
      success: true,
      data: rows,
      equipped_frame: equippedFrame,
    });
  } catch (error) {
    console.error("Inventory shop items error:", error.message);
    res.status(500).json({ success: false, message: "Khong the lay tui do shop." });
  }
};

exports.equipShopItem = async (req, res) => {
  try {
    const result = await ShopService.equipInventoryItem({
      userId: req.user.id,
      inventoryId: req.body.inventoryId,
    });

    res.json({
      success: true,
      message: "Trang bi vat pham thanh cong.",
      data: result,
    });
  } catch (error) {
    const status = getStatusFromMessage(error.message);
    console.error("Inventory equip item error:", error.message);
    res.status(status).json({ success: false, message: error.message });
  }
};

