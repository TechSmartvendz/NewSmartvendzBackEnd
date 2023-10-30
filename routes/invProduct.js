var express = require("express");
var router = express.Router();
const validator = require('express-joi-validation').createValidator();
// const invProductController = require("../controllers/inv_ProductController")
const {createProduct, getProduct, updateProduct, deleteProduct, bulkupload, sampletest} = require("../controllers/inv_ProductController")
const auth = require("../middleware/authentication");

router.post("/create", auth, createProduct);
router.get("/get", auth, getProduct);
router.put("/update", auth, updateProduct);
router.delete("/delete", auth, deleteProduct);

router.post("/bulkupload/test", bulkupload);
router.get("/sampletest", sampletest);

module.exports = router;