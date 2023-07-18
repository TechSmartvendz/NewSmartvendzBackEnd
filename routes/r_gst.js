const express = require("express");
const router = express.Router();
const rc = require("../controllers/responseController");
const { asyncHandler } = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");
const m_gst = require("../model/m_gst");

// add gst
router.post(
  "/addtax",
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role === "SuperAdmin") {
      let newRow = new m_gst(req.body);
      newRow.admin = req.user.id;
      if (!newRow) {
        return rc.setResponse(res, {
          msg: "No Data to insert",
        });
      }
      const data = await m_gst.addRow(newRow);
      if (data) {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Inserted",
          data: data,
        });
      }
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

// get gst
router.get(
  "/AllTax",
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role === "SuperAdmin") {
      const data = await m_gst.find({ isDeleted: false });
      let sendData = [];
      for (let i = 0; i < data.length; i++) {
        sendData.push({
          _id: data[i]._id,
          gstName: data[i].gstName,
          gstRate: data[i].gstRate,
        });
      }
      if (data) {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: sendData,
        });
      } else {
        return rc.setResponse(res, {
          msg: "Data not Found",
        });
      }
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

// get gst by id
router.get(
  "/tax/:id",
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role === "SuperAdmin") {
      const data = await m_gst.findOne(
        { _id: req.params.id },
        { isDeleted: false }
      );
      let sendData = [];
      for (let i = 0; i < data.length; i++) {
        sendData.push({
          _id: data[i]._id,
          gstName: data[i].gstName,
          gstRate: data[i].gstRate,
        });
      }
      if (data) {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: sendData,
        });
      } else {
        return rc.setResponse(res, {
          msg: "Data not Found",
        });
      }
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

// edit gst
router.put(
  "/edittax/:id",
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role === "SuperAdmin") {
      const data = await m_gst.findOneAndUpdate(
        { _id: req.params.id },
        { $set: newdata }
      );
      if (data) {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: data,
        });
      } else {
        return rc.setResponse(res, {
          msg: "Data not Found",
        });
      }
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

// soft delete gst
router.put(
  "/deletetax/:id",
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role === "SuperAdmin") {
      const data = await m_gst.findOneAndUpdate(
        { _id: req.params.id },
        { isDeleted: true }
      );
      if (data) {
        return rc.setResponse(res, {
          success: true,
          msg: "Data deleted",
          data: data,
        });
      } else {
        return rc.setResponse(res, {
          msg: "Data not Found",
        });
      }
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

// delete permanentely
router.delete(
  "/deletetaxpermanentely/:id",
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role === "SuperAdmin") {
      const data = await m_gst.findOneAndRemove({ _id: req.params.id });
      if (data) {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Deleted permantely",
          data: data,
        });
      } else {
        return rc.setResponse(res, {
          msg: "Data not Found",
        });
      }
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

module.exports = router;
