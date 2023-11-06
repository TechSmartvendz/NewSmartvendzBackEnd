var express = require("express");
var router = express.Router();
const {
  addTDS,
  addTdsSection,
  getTDS,
  getTdsSection,
  getTDSById,
  getTdsSectionById,
  updateTDS,
  updateTdsSection,
  deleteTDS,
  deleteTdsSection,
} = require("../controllers/inv_TDSController");
const auth = require("../middleware/authentication");

router.post("/add", addTDS);
router.get("/get", getTDS);
router.get("/getById", getTDSById);
router.put("/update", updateTDS);
router.put("/delete", deleteTDS);

router.post("/add/section", addTdsSection);
router.get("/get/section", getTdsSection);
router.get("/getById/section", getTdsSectionById);
router.put("/update/section", updateTdsSection);
router.put("/delete/section", deleteTdsSection);

module.exports = router;
