var express = require("express");
var router = express.Router();
const validator = require('express-joi-validation').createValidator();
const {addUnit, getUnit, getUnitById, deleteUnit, updateUnit} = require("../controllers/inv_UnitController")
const auth = require("../middleware/authentication");

router.post("/add", addUnit);
router.get("/get", getUnit);
router.get("/getById", getUnitById);
router.put("/update", updateUnit);
router.put("/delete", deleteUnit);

module.exports = router;