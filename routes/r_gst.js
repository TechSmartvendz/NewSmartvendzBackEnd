const express = require("express");
const router = express.Router();
const rc = require("../controllers/responseController");
const { asyncHandler } = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");
const m_gst = require("../model/gst");

// add gst
router.post(
  "/",
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

// get data
router.get(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role === "SuperAdmin") {
      const data = await m_gst.find({ isDeleted: false });
      let sendData = [];
      for (let i = 0; i < data.length; i++) {
        sendData.push({
          _id: data[i]._id,
          hsn_Code: data[i].hsn_Code,
          hsn_description: data[i].hsn_description,
          cgst: data[i].cgst,
          sgst: data[i].sgst,
          igst: data[i].igst,
          cess: data[i].cess,
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

// get gst
router.get(
  "/Datalist",
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role === "SuperAdmin") {
      const data = await m_gst.find({ isDeleted: false });
      let sendData = [];
      for (let i = 0; i < data.length; i++) {
        sendData.push({
          _id: data[i]._id,
          hsn_Code: data[i].hsn_Code,
          hsn_description: data[i].hsn_description,
          cgst: data[i].cgst,
          sgst: data[i].sgst,
          igst: data[i].igst,
          cess: data[i].cess,
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
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role === "SuperAdmin") {
      const data = await m_gst.find(
        { _id: req.params.id },
        { isDeleted: false }
      );
      let sendData = [];
      for (let i = 0; i < data.length; i++) {
        sendData.push({
          _id: data[i]._id,
          hsn_Code: data[i].hsn_Code,
          hsn_description: data[i].hsn_description,
          cgst: data[i].cgst,
          sgst: data[i].sgst,
          igst: data[i].igst,
          cess: data[i].cess,
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
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role === "SuperAdmin") {
      const newdata = req.body;
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
  "/:id",
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
  "/:id",
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
