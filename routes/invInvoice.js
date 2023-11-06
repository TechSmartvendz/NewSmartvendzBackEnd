var express = require("express");
var router = express.Router();
const validator = require("express-joi-validation").createValidator();
const {
  addInvoice,
  getInvoice,
  getInvoiceById,
  updateInvoice,
  nextInvoiceNumber,
} = require("../controllers/inv_InvoiceController");
const auth = require("../middleware/authentication");

router.post("/add", addInvoice);
router.get("/get", getInvoice);
router.get("/getById", getInvoiceById);
router.put("/update", updateInvoice);
router.get("/nextInvoice", nextInvoiceNumber);

module.exports = router;