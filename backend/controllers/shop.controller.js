const ShopService = require("../services/shop.service");

function getStatusFromMessage(message) {
  const businessErrors = [
    "itemId khong hop le.",
    "quantity khong hop le.",
    "inventoryId khong hop le.",
    "Vat pham khong ton tai.",
    "Vat pham nay tam thoi khong mo ban.",
    "Vat pham nay khong the mua truc tiep trong shop.",
    "Chi vat pham tieu hao moi duoc mua nhieu hon 1 lan.",
    "Ban da so huu vat pham vinh vien nay roi.",
    "Khong du Linh Thach",
    "Vat pham khong ton tai trong tui do.",
    "Vat pham da het han su dung.",
    "Vat pham nay khong the trang bi.",
    "DB hien tai van dang bat buoc reward_id khac NULL. Can ALTER reward_id cho phep NULL truoc khi luu item shop bang shop_item_id.",
  ];

  return businessErrors.includes(message) ? 400 : 500;
}

exports.getCatalog = async (req, res) => {
  try {
    const items = await ShopService.getCatalog({
      itemType: req.query.itemType || null,
    });

    res.json({ success: true, data: items });
  } catch (error) {
    console.error("Shop catalog error:", error.message);
    res.status(500).json({ success: false, message: "Khong the lay danh sach vat pham shop." });
  }
};

exports.buyItem = async (req, res) => {
  try {
    const result = await ShopService.buyItem({
      userId: req.user.id,
      itemId: req.body.itemId,
      quantity: req.body.quantity,
    });

    res.json({
      success: true,
      message: "Mua vat pham thanh cong.",
      data: result,
    });
  } catch (error) {
    const status = getStatusFromMessage(error.message);
    console.error("Shop buy error:", error.message);
    res.status(status).json({ success: false, message: error.message });
  }
};

exports.getMyTransactions = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const rows = await ShopService.getUserTransactions(req.user.id, limit);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Shop transaction error:", error.message);
    res.status(500).json({ success: false, message: "Khong the lay lich su giao dich shop." });
  }
};
