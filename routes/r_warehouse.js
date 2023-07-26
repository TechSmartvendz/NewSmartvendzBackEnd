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

const CsvParser = require("json2csv").Parser;
const csv = require("csv-parser");
const fs = require("fs");
const { upload } = require("../middleware/fileUpload");

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
      // const warehouseidcheck = await warehouseTable.findOne({
      //   wareHouseName: req.body.warehouse,
      // });
      // const productidcheck = await productTable.findOne({
      //   productname: req.body.product,
      // });
      const warehouseid = await warehouseTable.findOne({
        wareHouseName: req.body.warehouse,
      });
      // console.log("warehouseID",warehouseid._id)
      const productid = await productTable.findOne({
        productname: req.body.product,
      });
      const existingStock = await warehouseStock
        .findOne({ warehouse: warehouseid._id }, { product: productid._id })
        .select("productQuantity sellingPrice admin warehouse product")
        .populate("warehouse product");
      console.log(
        "-----------------------existingstock---------------------------"
      );
      // console.log(existingStock);
      console.log(
        "-----------------------existingstock---------------------------"
      );
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

// SampleCSV purchase stock
router.get(
  "/purchaseStock/SampleCSV",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    // console.log(query);
    let cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    // console.log(cdata);
    if (cdata.updatebulkproduct) {
      const j = {
        warehouse: "",
        product: "",
        supplier: "",
        productQuantity: "",
        totalPrice: "",
        sellingPrice: "",
        invoiceNumber: "",
        GRN_Number: "",
        gst: "",
      };
      const csvFields = [
        "warehouse",
        "product",
        "supplier",
        "productQuantity",
        "totalPrice",
        "sellingPrice",
        "invoiceNumber",
        "GRN_Number",
        "gst",
      ];
      const csvParser = new CsvParser({ csvFields });
      const csvdata = csvParser.parse(j);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=SamplePurchaseStock.csv"
      );
      res.status(200).end(csvdata);
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

// bulk upload purchase stock
router.post(
  "/PurchaseStock/ImportCSV",
  auth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const results = [];
    var rejectdata = [];

    function reject(x) {
      if (x) {
        rejectdata.push(x);
      }
      return rejectdata;
    }

    var storeddata = [];

    function succ(x) {
      if (x) {
        storeddata.push(x);
      }
      return storeddata;
    }
    const query = { role: req.user.role };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);

    if (cdata.bulkproductupload) {
      var path = `public/${req.file.filename}`;
      fs.createReadStream(path)
        .pipe(csv({}))
        .on("data", async (data) => results.push(data))

        .on("end", async () => {
          console.log("result", results);
          for (i = 0; i < results.length; i++) {
            if (
              results[i].warehouse == "" ||
              results[i].warehouse == "NA" ||
              results[i].warehouse == "#N/A"
            ) {
              console.log(`warehouse is not available`);
              console.log(results[i]);
              results[i].error = "warehouse is missing";
              const r = reject(results[i]);
            } else if (
              results[i].product == "" ||
              results[i].product == "NA" ||
              results[i].product == "#N/A"
            ) {
              console.log(`product is not available`);
              console.log(results[i]);
              results[i].error = "product is missing";
              const r = reject(results[i]);
            } else if (
              results[i].supplier == "" ||
              results[i].supplier == "NA" ||
              results[i].supplier == "#N/A"
            ) {
              console.log(`supplier is not available`);
              console.log(results[i]);
              results[i].error = "supplier is missing";
              const r = reject(results[i]);
            } else if (
              results[i].productQuantity == "" ||
              results[i].productQuantity == "NA" ||
              results[i].productQuantity == "#N/A"
            ) {
              console.log(`productQuantity is not available`);
              console.log(results[i]);
              results[i].error = "productQuantity is missing";
              const r = reject(results[i]);
            } else if (
              results[i].sellingPrice == "" ||
              results[i].sellingPrice == "NA" ||
              results[i].sellingPrice == "#N/A"
            ) {
              console.log(`sellingPrice is not available`);
              console.log(results[i]);
              results[i].error = "sellingPrice is missing";
              const r = reject(results[i]);
            } else if (
              results[i].totalPrice == "" ||
              results[i].totalPrice == "NA" ||
              results[i].totalPrice == "#N/A"
            ) {
              console.log(`totalPrice is not available`);
              console.log(results[i]);
              results[i].error = "totalPrice is missing";
              const r = reject(results[i]);
            } else if (
              results[i].invoiceNumber == "" ||
              results[i].invoiceNumber == "NA" ||
              results[i].invoiceNumber == "#N/A"
            ) {
              console.log(`invoiceNumber is not available`);
              console.log(results[i]);
              results[i].error = "invoiceNumber is missing";
              const r = reject(results[i]);
            } else if (
              results[i].GRN_Number == "" ||
              results[i].GRN_Number == "NA" ||
              results[i].GRN_Number == "#N/A"
            ) {
              console.log(`GRN_Number is not available`);
              console.log(results[i]);
              results[i].error = "GRN_Number is missing";
              const r = reject(results[i]);
            } else if (
              results[i].gst == "" ||
              results[i].gst == "NA" ||
              results[i].gst == "#N/A"
            ) {
              console.log(`gst is not available`);
              console.log(results[i]);
              results[i].error = "gst is missing";
              const r = reject(results[i]);
            } else {
              try {
                if (cdata.purchaseStock) {
                  const productdata = await productTable.findOne({
                    productname: results[i].product,
                  });
                  const supplierdata = await supplierTable.findOne({
                    supplierName: results[i].supplier,
                  });
                  const warehousedata = await warehouseTable.findOne({
                    wareHouseName: results[i].warehouse,
                  });
                  const gstID = await gstTable.findOne({
                    hsn_Code: results[i].gstName,
                  });

                  const existingStock = await warehouseStock
                    .findOne(
                      { warehouse: warehousedata._id },
                      { product: productdata._id }
                    )
                    .select(
                      "productQuantity sellingPrice admin warehouse product"
                    )
                    .populate("warehouse product");
                  console.log(
                    "-----------------------existingstock---------------------------"
                  );
                  // console.log(existingStock);
                  console.log(
                    "-----------------------existingstock---------------------------"
                  );

                  if (existingStock) {
                    console.log("---------------");
                    existingStock.productQuantity += parseInt(
                      results[i].productQuantity
                    );
                    await existingStock.save();
                    console.log(
                      "-------------------stock Updated--------------------"
                    );
                  } else {
                    const stock = {
                      warehouse: warehousedata._id,
                      product: productdata._id,
                      productQuantity: results[i].productQuantity,
                      sellingPrice: results[i].sellingPrice,
                    };
                    let newstock = new warehouseStock(stock);
                    newstock.admin = req.user._id;
                    if (!newstock) {
                      return rc.setResponse(res, {
                        msg: "No Data to insert",
                      });
                    }
                    const warehousedata = await warehouseStock.addRow(newstock);
                    console.log("-----------------data inserted------------------")
                  }

                  let newRow = {
                    warehouse: warehousedata._id,
                    product: productdata._id,
                    supplier: supplierdata._id,
                    productQuantity: results[i].productQuantity,
                    totalPrice: results[i].totalPrice,
                    sellingPrice: results[i].sellingPrice,
                    invoiceNumber: results[i].invoiceNumber,
                    GRN_Number: results[i].GRN_Number,
                    gst: gstID._id,
                    admin: req.user._id,
                  };
                  const newData = await purchaseStock(newRow);
                  await newData.save();
                  if (newData) {
                    const r = succ(results[i]);
                  }
                }
              } catch {
                console.log(e);
                if (e.code == 11000) {
                  results[i].error = "Duplicate Entry";
                  const r = reject(results[i]);
                } else {
                  results[i].error = e;
                  const r = reject(results[i]);
                }
              }
            }
          }
          console.log("storeddata.length", storeddata.length);
          console.log("rejectdata", rejectdata);
          console.log("rejectdata.length", rejectdata.length);

          if (rejectdata.length > 0) {
            return rc.setResponse(res, {
              success: true,
              msg: "Data Fetched",
              data: {
                dataupload: "partial upload",
                reject_data: rejectdata,
                stored_data: storeddata.length,
              },
            });
            // res.status(200).json({ "dataupload": "error", "reject_data": rejectdata, "stored_data": storeddata.length });
          } else {
            return rc.setResponse(res, {
              success: true,
              msg: "Data Fetched",
              data: { dataupload: "success", stored_data: storeddata.length },
            });
          }
        });
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
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
