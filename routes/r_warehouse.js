const express = require("express");
const router = express.Router();
const TableModelPermission = require("../model/m_permission");
const warehouseTable = require("../model/m_warehouse");
const rc = require("../controllers/responseController");
const { asyncHandler } = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");

router.post(
  "/addWareHouse",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.addWareHouse) {
      newRow = new warehouseTable(req.body);
      newRow.admin = req.user._id;
      // newRow.country=cdata.id
      if (!newRow) {
        return rc.setResponse(res, {
          msg: "No Data to insert",
        });
      }
      const checkdata = await warehouseTable.find({
        $and: [
          { phoneNumber: req.body.phoneNumber },
          { wareHouseName: req.body.wareHouseName },
          { area: req.body.area },
        ],
      });
      if (checkdata.phoneNumber) {
        return rc.setResponse(res, {
          msg: "Already registered",
        });
      }
      const data = await warehouseTable.addRow(newRow);
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
  "/getAllWarehouses",
  auth,
  asyncHandler(async (req, res, next) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.listWarehouse) {
      const data = await warehouseTable.find().select('_id wareHouseName city contactPerson ');
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
  "/getWarehouse/:id",
  auth,
  asyncHandler(async (req, res, next) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.listWarehouse) {
      const data = await warehouseTable.findOne({_id: req.params.id});
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

// router.put(
//   "/addStock/:id",
//   auth,
//   asyncHandler(async (req, res) => {
//     const query = {
//       role: req.user.role,
//     };
//     var pdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
//     if (pdata.addStock) {
//       let query = {
//         warehouse: req.body._id,
//       };
//       const cdata = await warehouseTable.find(query);
//       if (!cdata) {
//         return rc.setResponse(res, {
//           msg: "Warehouse not Found",
//         });
//       } else {
//         var newRow = req.body;
//         query = {
//           _id: req.params.id,
//         };
//         var newRow = await warehouseTable.findOneAndUpdate(query, {
//           $set: newRow,
//         });
//         if (!newRow) {
//           return rc.setResponse(res, {
//             msg: "No Data to update",
//           });
//         } else {
//           return rc.setResponse(res, {
//             success: true,
//             msg: "Warehouse Stock Updated",
//             data: newRow,
//           });
//         }
//       }
//     }
//   })
// );

router.put(
  "/addStock/:id",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    var pdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (pdata.addStock) {
      let query = {
        warehouse: req.body._id,
      };
      const cdata = await warehouseTable.find(query);
      if (!cdata) {
        return rc.setResponse(res, {
          msg: "Warehouse not Found",
        });
      } else {
        let newRow = req.body;
        let stocks = {
          productName: newRow.productName,
          quantity: newRow.quantity,
          price: newRow.price,
        };

        const data = await warehouseTable.findOneAndUpdate(query, newRow);
      }
    }
  })
);

module.exports = router;
