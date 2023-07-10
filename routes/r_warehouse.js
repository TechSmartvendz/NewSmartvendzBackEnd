const express = require("express");
const router = express.Router();
const TableModelPermission = require("../model/m_permission");
const warehouseTable = require("../model/m_warehouse");
const warehouseStock = require("../model/m_warehouse_Stock");
const purchaseStock = require("../model/m_purchase_stocks");
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

// add warehouse stock
router.post(
  "/addWarehouseStock",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    var pdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (pdata.addStockl) {
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
        .select(
          "wareHouseId productName productQuantity sellingPrice invoiceNumber GRN_Number"
        )
        .populate("wareHouseId");
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
          .select(
            "wareHouseId productName productQuantity sellingPrice invoiceNumber GRN_Number"
          )
          .populate("wareHouseId")
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

// purchase stocks
router.post(
  "/purchaseStock",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.purchaseStock) {
      const existingStock = await warehouseStock
        .findOne(
          { warehouse: req.body.warehouse },
          { product: req.body.product }
        )
        .select("productQuantity sellingPrice admin warehouse product")
        .populate("warehouse product");
      console.log(
        "-----------------------existingstock---------------------------"
      );
      console.log(existingStock);
      console.log(
        "-----------------------existingstock---------------------------"
      );
      if (existingStock) {
        console.log("---------------");
        existingStock.productQuantity += req.body.productQuantity;
        await existingStock.save();
        console.log("-------------------stock Updated--------------------");
      } else {
        const stock = {
          warehouse: req.body.warehouse,
          product: req.body.product,
          productQuantity: req.body.productQuantity,
          sellingPrice: req.body.sellingPrice,
        };
        let newstock = new warehouseStock(stock);
        newstock.admin = req.user._id;
        if (!newstock) {
          return rc.setResponse(res, {
            msg: "No Data to insert",
          });
        }
        const warehousedata = await warehouseStock.addRow(newstock);
        // if (warehousedata) {
        //   rc.setResponse(res, {
        //     success: true,
        //     msg: "Data Inserted",
        //     data: warehousedata,
        //   });
        // }
        console.log("------------------data inserted---------------");
      }
      let newRow = new purchaseStock(req.body);
      newRow.admin = req.user._id;
      if (!newRow) {
        return rc.setResponse(res, {
          msg: "No Data to insert",
        });
      }
      console.log(newRow);
      const data = await purchaseStock.addRow(newRow);
      console.log(data);
      if (data) {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Inserted",
          data: data,
        });
      }
    } else {
      return rc.setResponse(res, {
        msg: "no permission to purchase",
        error: { code: 403 },
      });
    }
  })
);

router.get(
  "/purchasestocklist",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.purchaseStockList) {
      const data = await purchaseStock
        .find()
        .populate("warehouse", ["wareHouseName","email","address","state","city","country","phoneNumber","contactPerson","pincode"])
        .populate("product", ["productid","productname","description","materialtype","sellingprice",])
        .populate("supplier",["supplierName","supplierEmail","supplierPhone","supplierAddress","contactPerson","area","state","city","country","pincode"]
        );
      // console.log(data);
      if (data) {
        return rc.setResponse(res, {
          success: true,
          msg: "data fetched",
          data: data,
        });
      }
    } else {
      return rc.setResponse(res, {
        msg: "no permission to see purchase list",
        error: { code: 403 },
      });
    }
  })
);

router.get(
  "/purchasestocklist/:id",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.purchaseStockList) {
      const data = await purchaseStock
        .find({_id: req.params.id})
        .populate("warehouse", ["wareHouseName","email","address","state","city","country","phoneNumber","contactPerson","pincode"])
        .populate("product", ["productid","productname","description","materialtype","sellingprice",])
        .populate("supplier",["supplierName","supplierEmail","supplierPhone","supplierAddress","contactPerson","area","state","city","country","pincode"]
        );
      // console.log(data);
      if (data) {
        return rc.setResponse(res, {
          success: true,
          msg: "data fetched",
          data: data,
        });
      }
    } else {
      return rc.setResponse(res, {
        msg: "no permission to see purchase list",
        error: { code: 403 },
      });
    }
  })
);

module.exports = router;
