var express = require("express");
var router = express.Router();
const validator = require('express-joi-validation').createValidator();
// const invTaxController = require("../controllers/inv_TaxController")
const {addPaymentTerm, getPaymentTerm, updatePaymentTerm, deletePaymentTerm, getPaymentTermById} = require("../controllers/inv_PaymentTerm")
const auth = require("../middleware/authentication");

router.post("/add", addPaymentTerm);
router.get("/get", getPaymentTerm);
router.get("/getById", getPaymentTermById);
router.put("/update", updatePaymentTerm);
router.put("/delete", deletePaymentTerm);

module.exports = router;