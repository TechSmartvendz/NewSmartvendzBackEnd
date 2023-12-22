var express = require("express");
var router = express.Router();
const validator = require("express-joi-validation").createValidator();
const {
  addInvoice,
  getInvoice,
  getInvoiceById,
  updateInvoice,
  nextInvoiceNumber,
  getInvoicePayment,
  updateInvoicePayment
} = require("../controllers/inv_InvoiceController");
const auth = require("../middleware/authentication");

router.post("/add", auth, addInvoice);
router.get("/get", auth, getInvoice);
router.get("/getById", auth, getInvoiceById);
router.put("/update", updateInvoice);
router.get("/nextInvoice", auth, nextInvoiceNumber);
router.get("/getInvoicePayment", auth, getInvoicePayment);
router.put("/updateInvoicePayment", auth, updateInvoicePayment);

module.exports = router;