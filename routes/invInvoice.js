var express = require("express");
var router = express.Router();
const validator = require('express-joi-validation').createValidator();
const {addInvoice, getInvoice, getInvoiceById, updateInvoice} = require("../controllers/inv_Invoice")
const auth = require("../middleware/authentication");

router.post("/add", addInvoice);
router.get("/get", getInvoice);
router.get("/getById", getInvoiceById);
router.put("/add", updateInvoice);

module.exports = router;