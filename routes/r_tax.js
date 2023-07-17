const express = require("express");
const router = express.Router();
const rc = require("../controllers/responseController");
const { asyncHandler } = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");
const m_tax = require("../model/m_tax");

router.post(
  "/addtax",
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role === "SuperAdmin") {
      let newRow = new m_tax(req.body);
      newRow.admin = req.user.id;
      if (!newRow) {
        return rc.setResponse(res, {
          msg: "No Data to insert",
        });
      }
      const data = await m_tax.addRow(newRow);
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

router.get(
  "/AllTax",
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role === "SuperAdmin") {
      const data = await m_tax.find({ isDeleted: false });
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

router.get(
  "/tax/:id",
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role === "SuperAdmin") {
      const data = await m_tax.findOne(
        { _id: req.params.id },
        { isDeleted: false }
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

router.put(
  "/edittax/:id",
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role === "SuperAdmin") {
      const data = await m_tax.findOneAndUpdate(
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

router.put(
  "/deletetax/:id",
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role === "SuperAdmin") {
      const data = await m_tax.findOneAndUpdate(
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

router.delete(
    "/deletetaxpermanentely/:id",
    auth,
    asyncHandler(async (req, res) => {
      if (req.user.role === "SuperAdmin") {
        const data = await m_tax.findOneAndRemove(
          { _id: req.params.id }
        );
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