const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const inventoryController = require("../controllers/inventory.controller");

router.get("/badges", authenticateToken, inventoryController.getUserBadges);
router.get("/items", authenticateToken, inventoryController.getMyShopInventory);

router.post("/equip", authenticateToken, inventoryController.equipBadge);
router.post("/equip-badge", authenticateToken, inventoryController.equipBadge);
router.post("/equip-item", authenticateToken, inventoryController.equipShopItem);

module.exports = router;

