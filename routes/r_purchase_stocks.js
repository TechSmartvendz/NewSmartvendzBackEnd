const express = require("express");
const router = express.Router();
const purchaseStockController = require("../controllers/purchaseStockController");
const auth = require("../middleware/auth");

// Route to download purchase data based on date range
router.get("/purchase-stocks/download", auth, purchaseStockController.downloadPurchaseData);

module.exports = router;