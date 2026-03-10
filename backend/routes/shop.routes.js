const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const shopController = require("../controllers/shop.controller");

router.get("/items", shopController.getCatalog);
router.post("/buy", authenticateToken, shopController.buyItem);
router.get("/transactions", authenticateToken, shopController.getMyTransactions);

module.exports = router;

