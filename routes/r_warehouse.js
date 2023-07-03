const express = require("express");
const router = express.Router();
const TableModelPermission = require("../model/m_permission");
const warehouseTable = require("../model/m_warehouse");
const warehouseStock = require("../model/m_warehouse_Stock");
const rc = require("../controllers/responseController");
const { asyncHandler } = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");

// add warehouse
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

// list all warehouses
router.get(
  "/getAllWarehouses",
  auth,
  asyncHandler(async (req, res, next) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.listWarehouse) {
      const data = await warehouseTable
        .find({ isDeleted: false })
        .select("_id wareHouseName city contactPerson ");
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

// get warehouseby id
router.get(
  "/getWarehouse/:_id",
  auth,
  asyncHandler(async (req, res, next) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.listWarehouse) {
      const data = await warehouseTable.findOne(
        { _id: req.params._id },
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

// Update warehouse
router.put(
  "/updateWareHouse/:_id",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    let cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (!cdata) {
      return rc.setResponse(res, {
        success: false,
        msg: "no permission to update warehouse",
      });
    } else {
      const rid = req.params._id;
      const pararms = req.body;
      const updatedata = await warehouseTable.findByIdAndUpdate(rid, pararms);
      return rc.setResponse(res, {
        success: true,
        msg: "data updated",
        data: updatedata,
      });
    }
  })
);

// deleteWarehouse
router.put(
  "/deleteWareHouse/:_id",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    let cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (!cdata) {
      return rc.setResponse(res, {
        success: false,
        msg: "no permission to delete warehouse",
      });
    } else {
      const rid = req.params._id;
      // const pararms = req.body;
      const updatedata = await warehouseTable.findByIdAndUpdate(rid, {
        isDeleted: true,
      });
      return rc.setResponse(res, {
        success: true,
        msg: "Warehouse deleted",
      });
    }
  })
);

// router.post(
//   "/warehouseStock",
//   auth,
//   asyncHandler(async (req, res) => {
//     const query = {
//       role: req.user.role,
//     };
//     let cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
//     if (!cdata) {
//       return rc.setResponse(res, {
//         success: false,
//         msg: "no permission to update warehouse",
//       });
//     } else {

//     }
//   })
// );

// router.post(
//   "/addWarehouseStock",
//   auth,
//   asyncHandler(async (req, res) => {
//     const query = {
//       role: req.user.role,
//     };
//     var pdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
//     if (pdata.addStock) {
//       const cdata = await warehouseStock.find(req.body);
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


// add warehouse stock
router.post(
  "/addWarehouseStock",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    var pdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (pdata.addStock) {
      newRow = new warehouseStock(req.body);
      newRow.admin = req.user._id;
      if (!newRow) {
        return rc.setResponse(res, {
          msg: "No Data to insert",
        });
      }
      const data = await warehouseStock.addRow(newRow);
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

// get all warehouseStock
router.get(
    "/getAllWarehouseStocks",
    auth,
    asyncHandler(async (req, res, next) => {
      const query = {
        role: req.user.role,
      };
      var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
      if (cdata.listStock) {
        const data = await warehouseStock
          .find({ isDeleted: false })
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

  // get warehouseStocks by id
router.get(
    "/getWarehouseStock/:_id",
    auth,
    asyncHandler(async (req, res, next) => {
      const query = {
        role: req.user.role,
      };
      var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
      if (cdata.listWarehouse) {
        const data = await warehouseStock.findOne(
          { _id: req.params._id },
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

  // Update warehouseStock
router.put(
    "/updateWareHouseStock/:_id",
    auth,
    asyncHandler(async (req, res) => {
      const query = {
        role: req.user.role,
      };
      let cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
      if (!cdata) {
        return rc.setResponse(res, {
          success: false,
          msg: "no permission to update warehouse",
        });
      } else {
        const rid = req.params._id;
        const pararms = req.body;
        const updatedata = await warehouseStock.findByIdAndUpdate(rid, pararms);
        return rc.setResponse(res, {
          success: true,
          msg: "data updated",
          data: updatedata,
        });
      }
    })
  );

  // deleteWarehouse Stock
router.put(
    "/deleteWareHouseStock/:_id",
    auth,
    asyncHandler(async (req, res) => {
      const query = {
        role: req.user.role,
      };
      let cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
      if (!cdata) {
        return rc.setResponse(res, {
          success: false,
          msg: "no permission to delete warehouse",
        });
      } else {
        const rid = req.params._id;
        // const pararms = req.body;
        const updatedata = await warehouseStock.findByIdAndUpdate(rid, {
          isDeleted: true,
        });
        return rc.setResponse(res, {
          success: true,
          msg: "WarehouseStock deleted",
        });
      }
    })
  );

module.exports = router;
