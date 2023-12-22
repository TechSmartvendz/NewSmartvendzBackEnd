var express = require("express");
var router = express.Router();
const validator = require('express-joi-validation').createValidator();
const {addUnit, getUnit, getUnitById, deleteUnit, updateUnit} = require("../controllers/inv_UnitController")
const auth = require("../middleware/authentication");

router.post("/add", auth, addUnit);
router.get("/get",auth, getUnit);
router.get("/getById",auth, getUnitById);
router.put("/update",auth, updateUnit);
router.put("/delete",auth, deleteUnit);

module.exports = router;