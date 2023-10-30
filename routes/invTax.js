var express = require("express");
var router = express.Router();
const validator = require('express-joi-validation').createValidator();
// const invTaxController = require("../controllers/inv_TaxController")
const {addTax, getTax, updateTax, deleteTax, getTaxById} = require("../controllers/inv_TaxController")
const auth = require("../middleware/authentication");

router.post("/add", addTax);
router.get("/get", getTax);
router.get("/getById", getTaxById);
router.put("/update", updateTax);
router.put("/delete", deleteTax);

module.exports = router;