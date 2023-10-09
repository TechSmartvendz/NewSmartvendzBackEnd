const express = require("express");
const router = express.Router();
const TableModelPermission = require("../model/m_permission");
const rc = require("../controllers/responseController");
const { asyncHandler } = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");
const supplier = require("../model/m_supplier");
const warehouse = require("../model/m_warehouse");

const validator = require("express-joi-validation").createValidator();
const { addSupplier, suppliedById } = require("../validation/supplier");

router.post(
  "/addSupplier",
  validator.body(addSupplier),
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
      if (checkSupplier[0]) {
        return rc.setResponse(res, {
          msg: "Already registered",
        });
      } else {
        const warehousedata = await warehouse.findOne({
          wareHouseName: req.body.warehouse,
        });
        newRow = new supplier(req.body);
        newRow.admin = req.user._id;
        newRow.warehouse = warehousedata._id;
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
  "/listSupplier/Datalist",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.listSupplier) {
      const newdata = await supplier
        .find({ isDeleted: false })
        .select("supplierName supplierEmail supplierPhone warehouse");
      const data = await Promise.all(
        newdata.map(async (index) => {
          const warehouseData = await warehouse.findOne({
            _id: index.warehouse,
          });
          return {
            _id: index._id,
            supplierName: index.supplierName,
            supplierEmail: index.supplierEmail,
            supplierPhone: index.supplierPhone,
            warehouseData: warehouseData.wareHouseName,
          };
        })
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

router.get(
  "/listSupplier/:id",
  validator.params(suppliedById),
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.listSupplier) {
      const newdata = await supplier.find(
        { _id: req.params.id },
        { isDeleted: false }
      );
      const data = await Promise.all(
        newdata.map(async (index) => {
          const warehouseData = await warehouse.findOne({
            _id: index.warehouse,
          });
          return {
            _id: index._id,
            supplierName: index.supplierName,
            supplierEmail: index.supplierEmail,
            supplierPhone: index.supplierPhone,
            warehouse: warehouseData.wareHouseName,
            supplierAddress: index.supplierAddress,
            contactPerson: index.contactPerson,
            area: index.area,
            state: index.state,
            city: index.city,
            country: index.country,
            pincode: index.pincode,
          };
        })
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
  validator.params(suppliedById),
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
