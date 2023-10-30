var express = require("express");
var router = express.Router();
const validator = require('express-joi-validation').createValidator();
const {addInvoice} = require("../controllers/inv_Invoice")
const auth = require("../middleware/authentication");

router.post("/add", addInvoice);

module.exports = router;