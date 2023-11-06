let express = require("express");
let router = express.Router();

const {addCustomer} = require("../controllers/inv_CustomerController");

router.post("/add", addCustomer);

module.exports = router;