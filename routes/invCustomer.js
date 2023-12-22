let express = require("express");
let router = express.Router();
const auth = require("../middleware/authentication");
const { addCustomer, getCustomer, getCustomerById, updateCustomer, deleteCustomer } = require("../controllers/inv_CustomerController");

router.post("/add", auth, addCustomer);
router.get("/get", auth, getCustomer);
router.get("/getById", auth, getCustomerById);
router.put("/update", auth, updateCustomer);
router.put("/delete", auth, deleteCustomer);

module.exports = router;