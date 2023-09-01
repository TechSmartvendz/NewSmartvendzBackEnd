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

//------------------------------ new purchase request------------------------------//
router.post(
  "/purchaseStock",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    // console.log("req.body: ", req.body);
    const permissions = await TableModelPermission.getDataByQueryFilterDataOne(
      query
    );
    // console.log(permissions);
    if (permissions.purchaseStock) {
      try {
        const warehouseidcheck = await warehouseTable.findOne({
          wareHouseName: req.body.warehouse,
        });
        // console.log("warehouseidcheck: ", warehouseidcheck);

        const productidcheck = await productTable.findOne({
          productname: req.body.product,
        });
        // console.log("productidcheck: ", productidcheck);

        if (!warehouseidcheck) {
          return rc.setResponse(res, {
            success: false,
            msg: "Warehouse not found with the provided name.",
          });
        }

        if (!productidcheck) {
          return rc.setResponse(res, {
            success: false,
            msg: "Product not found with the provided name.",
          });
        }

        let existingStock = await warehouseStock
          .findOne({
            warehouse: warehouseidcheck._id,
            product: productidcheck._id,
          })
          .populate("warehouse product");
        // .findOne({ warehouse: warehouseidcheck._id }, { product: productidcheck._id })
        // .select("productQuantity sellingPrice admin warehouse product")

        console.log("------------existingstock--------------");
        // console.log("existingStock: ", existingStock);
        console.log("------------existingstock--------------");

        if (existingStock) {
          console.log("-----------------------------------------------------");

          existingStock.productQuantity += parseInt(req.body.productQuantity);
          await existingStock.save();
          console.log("-------------------stock Updated--------------------");
        } else {
          const stock = {
            warehouse: warehouseidcheck._id,
            product: productidcheck._id,
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
          await newstock.save();
          // const warehousedata = await warehouseStock.addRow(newstock);
          console.log("------------------data inserted---------------");
        }

        const warehouseid = warehouseidcheck._id;
        const productid = productidcheck._id;
        const supplierid = await supplierTable.findOne({
          supplierName: req.body.supplier,
        });

        const gstID = await gstTable.findOne({ hsn_Code: req.body.gstName });

        const purchaseStockData = {
          warehouse: warehouseid,
          product: productid,
          supplier: supplierid._id,
          productQuantity: req.body.productQuantity,
          sellingPrice: req.body.sellingPrice,
          totalPrice: req.body.totalPrice,
          gst: gstID._id,
          invoiceNumber: req.body.invoiceNumber,
          GRN_Number: req.body.GRN_Number,
          admin: req.user._id,
          date: req.body.date,
        };
        let newRow = new purchaseStock(purchaseStockData);
        newRow.admin = req.user._id;
        if (!newRow) {
          return rc.setResponse(res, {
            msg: "No Data to insert",
          });
        }
        console.log(newRow);
        await newRow.save();
        // const data = await purchaseStock.addRow(newRow);
        // console.log("purchaseStockData: ", newRow);
        if (newRow) {
          return rc.setResponse(res, {
            success: true,
            msg: "Data Inserted",
            data: newRow,
          });
        } else {
          return rc.setResponse(res, {
            success: false,
            msg: "Failed to insert data.",
          });
        }
      } catch (error) {
        console.error("Error:", error);
        return rc.setResponse(res, {
          success: false,
          msg: "An error occurred while processing the request.",
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

// ----------------------------*************************-----------------------------//
// -----Filters added in this request ---------//
// -----can also fid by warehouseName and productName-----------//
// get purchase stock list
router.get(
  "/purchasestocklist",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    console.log(req.query);
    let filters ;
    if (req.query.warehouse) {
      // filters["warehouse.wareHouseName"] = req.query.warehouse;
      const warehousedetail = await warehouseTable.findOne({wareHouseName: req.query.warehouse});
      console.log('warehousedetail: ', warehousedetail);
      filters ={ warehouse: warehousedetail._id};
    }
    if (req.query.productname) {
      const productdetail = await productTable.findOne({productname: req.query.productname});
      console.log('productdetail: ', productdetail);
      filters ={ product: productdetail._id};
    }
    console.log('filters: ', filters);
    
    if (cdata.purchaseStockList) {
      const data = await purchaseStock
        .find(filters)
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
      // console.log(data);
      let sendData = [];
      for (let i = 0; i < data.length; i++) {
        // const dateee = data[i].date.toLocaleDateString();
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
          // createdAt: data[i].createdAt.toLocaleDateString(),
          date: data[i].date,
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

// get purchase list pagination
router.get(
  "/purchasestocklist/Table/:page/:dataperpage",
  auth,
  asyncHandler(async (req, res, next) => {
    const page = req.params.page;
    const dataperpage = req.params.dataperpage;
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.productlist) {
      const admin = req.user.id;
      const data = await purchaseStock.getDataforTablePagination(
        page,
        dataperpage
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
        sellingPrice: "",
        totalPrice: "",
        invoiceNumber: "",
        GRN_Number: "",
        gst: "",
        date: "",
      };
      const csvFields = [
        "warehouse",
        "product",
        "supplier",
        "productQuantity",
        "sellingPrice",
        "totalPrice",
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
// router.post(
//   "/PurchaseStock/ImportCSV",
//   auth,
//   upload.single("file"),
//   asyncHandler(async (req, res) => {
//     const results = [];
//     let rejectdata = [];
//     let storeddata = [];
//     const query = { role: req.user.role };

//     function reject(x) {
//       if (x) {
//         rejectdata.push(x);
//       }
//       return rejectdata;
//     }

//     function succ(x) {
//       if (x) {
//         storeddata.push(x);
//       }
//       return storeddata;
//     }
//     var permissions = await TableModelPermission.getDataByQueryFilterDataOne(query);

//     if (permissions.bulkproductupload) {
//       var path = `public/${req.file.filename}`;
//       fs.createReadStream(path)
//         .pipe(csv({}))
//         .on("data", async (data) => results.push(data))
//         .on("end", async () => {
//           console.log("result", results);
//           for (i = 0; i < results.length; i++) {
//             if (
//               results[i].warehouse == "" ||
//               results[i].warehouse == "NA" ||
//               results[i].warehouse == "#N/A"
//             ) {
//               console.log(`warehouse is not available`);
//               console.log(results[i]);
//               results[i].error = "warehouse is missing";
//               const r = reject(results[i]);
//             } else if (
//               results[i].product == "" ||
//               results[i].product == "NA" ||
//               results[i].product == "#N/A"
//             ) {
//               console.log(`product is not available`);
//               console.log(results[i]);
//               results[i].error = "product is missing";
//               const r = reject(results[i]);
//             } else if (
//               results[i].supplier == "" ||
//               results[i].supplier == "NA" ||
//               results[i].supplier == "#N/A"
//             ) {
//               console.log(`supplier is not available`);
//               console.log(results[i]);
//               results[i].error = "supplier is missing";
//               const r = reject(results[i]);
//             } else if (
//               results[i].productQuantity == "" ||
//               results[i].productQuantity == "NA" ||
//               results[i].productQuantity == "#N/A"
//             ) {
//               console.log(`productQuantity is not available`);
//               console.log(results[i]);
//               results[i].error = "productQuantity is missing";
//               const r = reject(results[i]);
//             } else if (
//               results[i].sellingPrice == "" ||
//               results[i].sellingPrice == "NA" ||
//               results[i].sellingPrice == "#N/A"
//             ) {
//               console.log(`sellingPrice is not available`);
//               console.log(results[i]);
//               results[i].error = "sellingPrice is missing";
//               const r = reject(results[i]);
//             } else if (
//               results[i].totalPrice == "" ||
//               results[i].totalPrice == "NA" ||
//               results[i].totalPrice == "#N/A"
//             ) {
//               console.log(`totalPrice is not available`);
//               console.log(results[i]);
//               results[i].error = "totalPrice is missing";
//               const r = reject(results[i]);
//             } else if (
//               results[i].invoiceNumber == "" ||
//               results[i].invoiceNumber == "NA" ||
//               results[i].invoiceNumber == "#N/A"
//             ) {
//               console.log(`invoiceNumber is not available`);
//               console.log(results[i]);
//               results[i].error = "invoiceNumber is missing";
//               const r = reject(results[i]);
//             } else if (
//               results[i].GRN_Number == "" ||
//               results[i].GRN_Number == "NA" ||
//               results[i].GRN_Number == "#N/A"
//             ) {
//               console.log(`GRN_Number is not available`);
//               console.log(results[i]);
//               results[i].error = "GRN_Number is missing";
//               const r = reject(results[i]);
//             } else if (
//               results[i].gst == "" ||
//               results[i].gst == "NA" ||
//               results[i].gst == "#N/A"
//             ) {
//               console.log(`gst is not available`);
//               console.log(results[i]);
//               results[i].error = "gst is missing";
//               const r = reject(results[i]);
//             }else if (
//               results[i].date == "" ||
//               results[i].date == "NA" ||
//               results[i].date == "#N/A"
//             ) {
//               console.log(`date is not available`);
//               console.log(results[i]);
//               results[i].error = "date is missing";
//               const r = reject(results[i]);
//             }
//              else {
//               try {
//                 if (permissions.purchaseStock) {
//                   const productdata = await productTable.findOne({
//                     productname: results[i].product,
//                   });
//                   const supplierdata = await supplierTable.findOne({
//                     supplierName: results[i].supplier,
//                   });
//                   const warehousedata = await warehouseTable.findOne({
//                     wareHouseName: results[i].warehouse,
//                   });
//                   const gstID = await gstTable.findOne({
//                     hsn_Code: results[i].gst,
//                   });

//                   const existingStock = await warehouseStock
//                     .findOne(
//                       { warehouse: warehousedata._id },
//                       { product: productdata._id }
//                     )
//                     .populate("warehouse product");
//                     // .select(
//                     //   "productQuantity sellingPrice admin warehouse product"
//                     // )
//                   console.log(
//                     "-----------------------existingstock---------------------------"
//                   );
//                   console.log('existingStock: ', existingStock);
//                   console.log(
//                     "-----------------------existingstock---------------------------"
//                   );

//                   if (existingStock) {
//                     console.log("---------------");
//                     existingStock.productQuantity += parseInt(
//                       results[i].productQuantity
//                     );
//                     await existingStock.save();
//                     console.log(
//                       "-------------------stock Updated--------------------"
//                     );
//                   } else {
//                     const stock = {
//                       warehouse: warehousedata._id,
//                       product: productdata._id,
//                       productQuantity: results[i].productQuantity,
//                       sellingPrice: results[i].sellingPrice,
//                     };
//                     let newstock = new warehouseStock(stock);
//                     newstock.admin = req.user._id;
//                     if (!newstock) {
//                       return rc.setResponse(res, {
//                         msg: "No Data to insert",
//                       });
//                     }
//                     await newstock.save();
//                     // const newwarehousedata = await warehouseStock.addRow(
//                     //   newstock
//                     // );
//                     console.log(
//                       "-----------------data inserted------------------"
//                     );
//                   }

//                   let purchaseStockData = {
//                     warehouse: warehousedata._id,
//                     product: productdata._id,
//                     supplier: supplierdata._id,
//                     productQuantity: results[i].productQuantity,
//                     sellingPrice: results[i].sellingPrice,
//                     totalPrice: results[i].totalPrice,
//                     invoiceNumber: results[i].invoiceNumber,
//                     GRN_Number: results[i].GRN_Number,
//                     gst: gstID._id,
//                     admin: req.user._id,
//                     date: results[i].date
//                   };
//                   let newRow = await purchaseStock(purchaseStockData);
//                   newRow.admin = req.user._id
//                   if (!newRow) {
//                     return rc.setResponse(res, {
//                       msg: "No Data to insert",
//                     });
//                   }
//                   await newRow.save();
//                   if (newRow) {
//                     const r = succ(results[i]);
//                   }
//                 }
//               } catch (e) {
//                 console.log(e);
//                 if (e.code == 11000) {
//                   results[i].error = "Duplicate Entry";
//                   const r = reject(results[i]);
//                 } else {
//                   results[i].error = e;
//                   const r = reject(results[i]);
//                 }
//               }
//             }
//           }
//           console.log("storeddata.length", storeddata.length);
//           console.log("rejectdata", rejectdata);
//           console.log("rejectdata.length", rejectdata.length);

//           if (rejectdata.length > 0) {
//             return rc.setResponse(res, {
//               success: true,
//               msg: "Data Fetched",
//               data: {
//                 dataupload: "partial upload",
//                 reject_data: rejectdata,
//                 stored_data: storeddata.length,
//               },
//             });
//             // res.status(200).json({ "dataupload": "error", "reject_data": rejectdata, "stored_data": storeddata.length });
//           } else {
//             return rc.setResponse(res, {
//               success: true,
//               msg: "Data Fetched",
//               data: { dataupload: "success", stored_data: storeddata.length },
//             });
//           }
//         });
//     } else {
//       return rc.setResponse(res, { error: { code: 403 } });
//     }
//   })
// );

router.post(
  "/PurchaseStock/ImportCSV",
  auth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const results = [];
    const rejectdata = [];
    const storeddata = [];
    const query = { role: req.user.role };

    const permissions = await TableModelPermission.getDataByQueryFilterDataOne(
      query
    );
    if (!permissions.bulkproductupload) {
      return rc.setResponse(res, { error: { code: 403 } });
    }

    try {
      const path = `public/${req.file.filename}`;
      fs.createReadStream(path)
        .pipe(csv({}))
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          // console.log('results: ', results);
          for (let i = 0; i < results.length; i++) {
            const currentResult = results[i];
            let errorFound = false;
            // console.log("results[i] :", results);
            if (!currentResult.warehouse) {
              currentResult.error = "warehouse is missing";
              errorFound = true;
            } else if (!currentResult.product) {
              currentResult.error = "product is missing";
              errorFound = true;
            } else if (!currentResult.supplier) {
              currentResult.error = "supplier is missing";
              errorFound = true;
            } else if (!currentResult.productQuantity) {
              currentResult.error = "productQuantity is missing";
              errorFound = true;
            } else if (!currentResult.sellingPrice) {
              currentResult.error = "sellingPrice is missing";
              errorFound = true;
            } else if (!currentResult.totalPrice) {
              currentResult.error = "totalPrice is missing";
              errorFound = true;
            } else if (!currentResult.invoiceNumber) {
              currentResult.error = "invoiceNumber is missing";
              errorFound = true;
            } else if (!currentResult.GRN_Number) {
              currentResult.error = "GRN_Number is missing";
              errorFound = true;
            } else if (!currentResult.gst) {
              currentResult.error = "gst is missing";
              errorFound = true;
            } else if (!currentResult.date) {
              currentResult.error = "date is missing";
              errorFound = true;
            }

            if (errorFound) {
              rejectdata.push(currentResult);
              console.log("rejectdata: ", rejectdata);
            } else {
              try {
                const productdata = await productTable.findOne({
                  productname: currentResult.product,
                });
                const supplierdata = await supplierTable.findOne({
                  supplierName: currentResult.supplier,
                });
                const warehousedata = await warehouseTable.findOne({
                  wareHouseName: currentResult.warehouse,
                });
                const gstID = await gstTable.findOne({
                  hsn_Code: currentResult.gst,
                });

                let existingStock = await warehouseStock.findOne({
                  warehouse: warehousedata._id,
                  product: productdata._id,
                });
                console.log("existingStock: ", existingStock);

                if (existingStock) {
                  existingStock.productQuantity += parseInt(
                    currentResult.productQuantity
                  );
                  await existingStock.save();
                  console.log("----------existing stock updated---------");
                } else {
                  const stock = {
                    warehouse: warehousedata._id,
                    product: productdata._id,
                    productQuantity: currentResult.productQuantity,
                    sellingPrice: currentResult.sellingPrice,
                  };
                  let newstock = new warehouseStock(stock);
                  newstock.admin = req.user._id;
                  await newstock.save();
                  console.log("---------new stock created ---------------");
                }
                const dateParts = currentResult.date.split("-");
                const day = parseInt(dateParts[0]);
                const month = parseInt(dateParts[1]) - 1; // Months are 0-indexed
                const year = parseInt(dateParts[2]);
              
                // Create a Date object
                const purchaseDate = new Date(year, month, day);

                
              
                let purchaseStockData = {
                  warehouse: warehousedata._id,
                  product: productdata._id,
                  supplier: supplierdata._id,
                  productQuantity: currentResult.productQuantity,
                  sellingPrice: currentResult.sellingPrice,
                  totalPrice: currentResult.totalPrice,
                  invoiceNumber: currentResult.invoiceNumber,
                  GRN_Number: currentResult.GRN_Number,
                  gst: gstID._id,
                  admin: req.user._id,
                  date: purchaseDate,
                };

                let newRow = await purchaseStock(purchaseStockData);
                newRow.admin = req.user._id;
                await newRow.save();
                console.log(
                  "----------new purchase request created---------------"
                );
                storeddata.push(currentResult);
              } catch (e) {
                console.error(e);
                if (e.code == 11000) {
                  currentResult.error = "Duplicate Entry";
                } else {
                  currentResult.error = e.message || e.toString();
                }
                rejectdata.push(currentResult);
              }
            }
          }

          responseMsg = "Data Fetched";
          responseData = {
            dataupload: "success",
            stored_data: storeddata.length,
          };
          // console.log('responseMsg: ', responseMsg);
          // console.log('responseData: ', responseData);

          if (rejectdata.length > 0) {
            responseMsg = "Data Fetched (Partial Upload)";
            responseData = {
              dataupload: "partial upload",
              reject_data: rejectdata,
              stored_data: storeddata.length,
            };
          }
          return rc.setResponse(res, {
            success: true,
            msg: responseMsg,
            data: responseData,
          });
        });
    } catch (error) {
      console.error(error);
      return rc.setResponse(res, {
        success: false,
        msg: "An error occurred while processing the request.",
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

// get warehouse product by warehouseid
router.get(
  "/wareHouseProduct/Datalist",
  auth,
  asyncHandler(async (req, res) => {
    const query = { role: req.user.role };
    try {
      const permissions =
        await TableModelPermission.getDataByQueryFilterDataOne(query);
      if (!permissions.listStock) {
        return rc.setResponse(res, {
          success: false,
          msg: "Permission denied",
        });
      }
      const data = await warehouseStock
        .find({ warehouse: req.query.id })
        .populate("product", "_id productname productid")
        .select("_id product");
      const productarray = data.map((item) => ({
        _id: item.product._id,
        productname: item.product.productname,
        productid: item.product.productid,
      }));
      return rc.setResponse(res, {
        success: true,
        msg: "Data fetched",
        data: productarray,
      });
    } catch (error) {
      console.error("Error:", error);
      return rc.setResponse(res, {
        success: false,
        msg: "An error occurred while fetching data.",
      });
    }
  })
);

module.exports = router;
