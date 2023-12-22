var express = require("express");
var router = express.Router();
const validator = require('express-joi-validation').createValidator();
// const invTaxController = require("../controllers/inv_TaxController")
const {addPaymentTerm, getPaymentTerm, updatePaymentTerm, deletePaymentTerm, getPaymentTermById} = require("../controllers/inv_PaymentTermController")
const auth = require("../middleware/authentication");

router.post("/add",auth,  addPaymentTerm);
router.get("/get",auth,  getPaymentTerm);
router.get("/getById",auth,  getPaymentTermById);
router.put("/update",auth,  updatePaymentTerm);
router.put("/delete",auth,  deletePaymentTerm);

module.exports = router;