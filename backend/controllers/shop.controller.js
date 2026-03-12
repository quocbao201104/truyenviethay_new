const ShopService = require("../services/shop.service");

function getStatusFromMessage(message) {
  const businessErrors = [
    "itemId không hợp lệ.",
    "quantity không hợp lệ.",
    "quantity phai tu 1 den 999.",
    "inventoryId không hợp lệ.",
    "Vật phẩm không tồn tại.",
    "Vật phẩm này tạm thời không mở bán.",
    "Vật phẩm này không thể mua trực tiếp trong shop.",
    "Chỉ vật phẩm tiêu hao mới được mua nhiều hơn 1 lần.",
    "Bạn đã sở hữu vật phẩm vĩnh viễn này rồi.",
    "Không đủ Linh Thạch",
    "Vật phẩm không tồn tại trong túi đồ.",
    "Vật phẩm đã hết hạn sử dụng.",
    "Vật phẩm này không thể trang bị.",
    "DB hiện tại vẫn đang bắt buộc reward_id khác NULL. Can ALTER reward_id cho phép NULL trước khi lưu item shop bằng shop_item_id.",
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
    res.status(500).json({ success: false, message: "Không thể lấy danh sách vật phẩm shop." });
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
      message: "Mua vật phẩm thành công.",
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
    const offset = Number(req.query.offset) || 0;
    const { rows, total } = await ShopService.getUserTransactions(req.user.id, {
      limit,
      offset,
    });
    res.json({
      success: true,
      data: rows,
      meta: { total, limit, offset },
    });
  } catch (error) {
    console.error("Shop transaction error:", error.message);
    res.status(500).json({ success: false, message: "Không thể lấy lịch sử giao dịch shop." });
  }
};
