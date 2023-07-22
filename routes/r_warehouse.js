const express = require("express");
const router = express.Router();
const TableModelPermission = require("../model/m_permission");
const warehouseTable = require("../model/m_warehouse");
const warehouseStock = require("../model/m_warehouse_Stock");
const purchaseStock = require("../model/m_purchase_stocks");
const rc = require("../controllers/responseController");
const { asyncHandler } = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");
const productTable = require("../model/m_product");
const supplierTable = require("../model/m_supplier");
const gstTable = require("../model/gst");

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
  "/getAllWarehouses/Datalist",
  auth,
  asyncHandler(async (req, res, next) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.listWarehouse) {
      const data = await warehouseTable
        .find({ isDeleted: false })
        .select("_id wareHouseName city contactPerson machine ")
        .populate("machine");
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
        .select("warehouse product productQuantity sellingPrice ")
        .populate("warehouse")
        .populate("product");
      // console.log(data);
      let sendData = [];
      if (data) {
        for (let i = 0; i < data.length; i++) {
          sendData.push({
            _id: data[i]._id,
            product: data[i].product.productname,
            warehouse: data[i].warehouse.wareHouseName,
            productQuantity: data[i].productQuantity,
            sellingPrice: data[i].sellingPrice,
          });
        }
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
          .select("warehouse product productQuantity sellingPrice ")
          .populate("warehouse")
          .populate("product")
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
    // console.log(cdata);
    if (cdata.purchaseStock) {
      const warehouseidcheck = await warehouseTable.findOne({
        wareHouseName: req.body.warehouse,
      });
      const productidcheck = await productTable.findOne({
        productname: req.body.product,
      });
      const existingStock = await warehouseStock
        .findOne(
          { warehouse: warehouseidcheck._id },
          { product: productidcheck._id }
        )
        .select("productQuantity sellingPrice admin warehouse product")
        .populate("warehouse product");
      console.log(
        "-----------------------existingstock---------------------------"
      );
      // console.log(existingStock);
      console.log(
        "-----------------------existingstock---------------------------"
      );
      const warehouseid = await warehouseTable.findOne({
        wareHouseName: req.body.warehouse,
      });
      // console.log("warehouseID",warehouseid._id)
      const productid = await productTable.findOne({
        productname: req.body.product,
      });
      // console.log("productId",productid._id)
      const supplierid = await supplierTable.findOne({
        supplierName: req.body.supplier,
      });
      const gstID = await gstTable.findOne({ gstName: req.body.gstName });
      // console.log("supplierID",supplierid)
      if (existingStock) {
        console.log("---------------");
        existingStock.productQuantity += parseInt(req.body.productQuantity);
        await existingStock.save();
        console.log("-------------------stock Updated--------------------");
      } else {
        const stock = {
          warehouse: warehouseid._id,
          product: productid._id,
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
      const purchaseStockData = {
        warehouse: warehouseid._id,
        product: productid._id,
        supplier: supplierid._id,
        productQuantity: req.body.productQuantity,
        sellingPrice: req.body.sellingPrice,
        totalPrice: req.body.totalPrice,
        gst: gstID._id,
        invoiceNumber: req.body.invoiceNumber,
        GRN_Number: req.body.GRN_Number,
        admin: req.user._id,
      };
      let newRow = new purchaseStock(purchaseStockData);
      // newRow.admin = req.user._id;
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

// get purchase stock list
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
        .populate("warehouse", [
          "wareHouseName",
          "email",
          "address",
          "state",
          "city",
          "country",
          "phoneNumber",
          "contactPerson",
          "pincode",
        ])
        .populate("product", [
          "productid",
          "productname",
          "description",
          "materialtype",
          "sellingprice",
        ])
        .populate("supplier", [
          "supplierName",
          "supplierEmail",
          "supplierPhone",
          "supplierAddress",
          "contactPerson",
          "area",
          "state",
          "city",
          "country",
          "pincode",
        ])
        .populate("gst", ["gstName", "gstRate"]);
      console.log(data);
      let sendData = [];
      for (let i = 0; i < data.length; i++) {
        sendData.push({
          _id: data[i]._id,
          productName: data[i].product.productname,
          warehouse: data[i].warehouse.wareHouseName,
          supplier: data[i].supplier.supplierName,
          productQuantity: data[i].productQuantity,
          sellingPrice: data[i].sellingPrice,
          totalPrice: data[i].totalPrice,
          invoiceNumber: data[i].invoiceNumber,
          GRN_Number: data[i].GRN_Number,
          date: data[i].createdAt.toLocaleDateString(),
          gst: data[i].gst.gstName,
          gstRate: data[i].gst.gstRate,
        });
      }
      // console.log(data[0].gst);
      if (data) {
        return rc.setResponse(res, {
          success: true,
          msg: "data fetched",
          data: sendData,
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
// get purchase stock list by id
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
        .find({ _id: req.params.id })
        .populate("warehouse", [
          "wareHouseName",
          "email",
          "address",
          "state",
          "city",
          "country",
          "phoneNumber",
          "contactPerson",
          "pincode",
        ])
        .populate("product", [
          "productid",
          "productname",
          "description",
          "materialtype",
          "sellingprice",
        ])
        .populate("supplier", [
          "supplierName",
          "supplierEmail",
          "supplierPhone",
          "supplierAddress",
          "contactPerson",
          "area",
          "state",
          "city",
          "country",
          "pincode",
        ]);
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
