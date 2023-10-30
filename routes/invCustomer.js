let express = require("express");
let router = express.Router();

const {addCustomer} = require("../controllers/inv_Customer");

router.post("/add", addCustomer);

module.exports = router;