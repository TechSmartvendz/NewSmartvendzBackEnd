var express = require("express");
var router = express.Router();
const validator = require("express-joi-validation").createValidator();
// const invProductController = require("../controllers/inv_ProductController")
const {
  createProduct,
  getProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  bulkupload,
  exportProduct,
} = require("../controllers/inv_ProductController");
const auth = require("../middleware/authentication");
const { upload } = require("../middleware/fileUpload");

router.post("/create", auth, createProduct);
router.get("/get", auth, getProduct);
router.get("/getById", auth, getProductById);
router.put("/update", auth, updateProduct);
router.delete("/delete", auth, deleteProduct);

router.post("/bulkImport", auth, upload.single("filename"), bulkupload);
router.get("/exportCSV",auth, exportProduct);

module.exports = router;
