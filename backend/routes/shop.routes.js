const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const shopController = require("../controllers/shop.controller");
const { validateBuyItem } = require("../validators/shop.validator");

router.get("/items", shopController.getCatalog);
router.post("/buy", authenticateToken, validateBuyItem, shopController.buyItem);
router.get("/transactions", authenticateToken, shopController.getMyTransactions);

module.exports = router;

