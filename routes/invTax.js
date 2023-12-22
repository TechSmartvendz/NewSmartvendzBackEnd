var express = require("express");
var router = express.Router();
const validator = require('express-joi-validation').createValidator();
// const invTaxController = require("../controllers/inv_TaxController")
const {addTax, getTax, updateTax, deleteTax, getTaxById} = require("../controllers/inv_TaxController")
const auth = require("../middleware/authentication");

router.post("/add",auth, addTax);
router.get("/get",auth,  getTax);
router.get("/getById",auth,  getTaxById);
router.put("/update",auth,  updateTax);
router.put("/delete", auth, deleteTax);

module.exports = router;