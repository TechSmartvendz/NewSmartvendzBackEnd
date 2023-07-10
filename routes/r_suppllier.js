const express = require("express");
const router = express.Router();
const TableModelPermission = require("../model/m_permission");
const rc = require("../controllers/responseController");
const { asyncHandler } = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");
const supplier = require("../model/m_supplier");

router.post(
  "/addSupplier",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.addSupplier) {
      const checkSupplier = await supplier.find({
        $or: [
          { supplierName: req.body.supplierName },
          { supplierEmail: req.body.supplierEmail },
        ],
      });
      if (checkSupplier) {
        return rc.setResponse(res, {
          msg: "Already registered",
        });
      } else {
        newRow = new supplier(req.body);
        newRow.admin = req.user._id;
        if (!newRow) {
          return rc.setResponse(res, {
            msg: "No Data to insert",
          });
        }
        const data = await supplier.addRow(newRow);
        if (data) {
          return rc.setResponse(res, {
            success: true,
            msg: "Data Inserted",
            data: data,
          });
        }
      }
    } else {
      return rc.setResponse(res, {
        msg: "no permission to add supplier",
        error: { code: 403 },
      });
    }
  })
);

router.get(
  "/listSupplier",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.listSupplier) {
      const data = await supplier.find({ isDeleted: false });
      return rc.setResponse(res, {
        success: true,
        msg: "data fetched",
        data: data,
      });
    } else {
      rc.setResponse(res, {
        msg: "no permission to view suppliers",
      });
    }
  })
);

router.get(
  "/listSupplier/:id",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.listSupplier) {
      const data = await supplier.find(
        { _id: req.params.id },
        { isDeleted: false }
      );
      return rc.setResponse(res, {
        success: true,
        msg: "data fetched",
        data: data,
      });
    } else {
      rc.setResponse(res, {
        msg: "no permission to view suppliers",
      });
    }
  })
);

router.put(
  "/deleteSupplier/:id",
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role === "SuperAdmin") {
      const data = await supplier.findOneAndUpdate(
        { _id: req.params.id },
        { isDeleted: true }
      );
      return rc.setResponse(res, {
        success: true,
        msg: "data updated",
        data: data,
      });
    } else {
      rc.setResponse(res, {
        msg: "no permission to delete",
      });
    }
  })
);

module.exports = router;
