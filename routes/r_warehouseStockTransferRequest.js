const express = require("express");
const router = express.Router();

const rc = require("../controllers/responseController");
const { asyncHandler } = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");
const TableModelPermission = require("../model/m_permission");
const warehouseStock = require("../model/m_warehouse_Stock");
const warehouseTable = require("../model/m_warehouse");
const productTable = require("../model/m_product");
const WarehouseStockTransferRequest = require("../model/m_warehouseToWarehouse_Stock_TransferRequest");
const refillRequest = require("../model/m_refiller_request");
const machinedata = require("../model/m_machine");
const user_infos = require("../model/m_user_info");

const CsvParser = require("json2csv").Parser;
const csv = require("csv-parser");
const fs = require("fs");
const { upload } = require("../middleware/fileUpload");
const iconv = require("iconv-lite");
const path = require("path");
const helper = require("../helper/common");

const validator = require("express-joi-validation").createValidator();
const { salesReport } = require("../validation/sales_report");

// sendStockTransferRequest to warehouse  ------------not using this now--------------
router.post(
  "/sendStockTransferRequestsss",
  auth,
  asyncHandler(async (req, res) => {
    // console.log(req.body);
    const { fromWarehouse, toWarehouse, productName, quantity } = req.body;
    try {
      // Perform any necessary validation or business logic here before creating the request

      // Create a new stock transfer request in the database
      const fromwarehouse = await warehouseTable.findOne({
        wareHouseName: fromWarehouse,
      });
      const towarehouse = await warehouseTable.findOne({
        wareHouseName: toWarehouse,
      });
      const product = await productTable.findOne({ productname: productName });
      const warehouse = await warehouseStock.findOne({
        warehouse: fromwarehouse._id,
      });
      // console.log('fromwarehouse: ', fromwarehouse);
      // console.log('towarehouse: ', towarehouse);
      // console.log('warehouse: ', warehouse);
      // console.log('product: ', product);
      // console.log(warehouse.productQuantity);
      if (warehouse.productQuantity < quantity) {
        return rc.setResponse(res, {
          success: false,
          msg: "warehouse has less quantity",
        });
      }
      const transferRequest = new WarehouseStockTransferRequest({
        // fromWarehouse: fromwarehouse._id,
        // toWarehouse: towarehouse._id,
        // productName: product._id,
        // productQuantity: quantity,
        // status: "Pending",
        transferRequests: [
          {
            fromWarehouse: fromwarehouse._id,
            toWarehouse: towarehouse._id,
            productName: product._id,
            productQuantity: quantity,
          },
        ],
        status: "Pending",
      });
      await transferRequest.save();
      return rc.setResponse(res, {
        success: true,
        msg: "Stock transfer request sent.",
        // data: d
      });
    } catch (error) {
      console.log(error);
      return rc.setResponse(res, {
        error,
        msg: "Failed to send stock transfer request.",
      });
    }
  })
);
// new request of sendStockTransferRequest to warehouse
router.post(
  "/sendStockTransferRequest",
  auth,
  asyncHandler(async (req, res) => {
    // const transferRequests = req.body; // Array of transfer request objects
    const combinedData = []; // Array to store combined data for a single transfer request

    try {
      const fromwarehouse = await warehouseTable.findOne({
        wareHouseName: req.body.fromWarehouse,
      });
      const towarehouse = await warehouseTable.findOne({
        wareHouseName: req.body.toWarehouse,
      });
      for (let i = 0; i < req.body.products.length; i++) {
        // const { fromWarehouse, toWarehouse, productName, quantity } =
        const { productName, quantity } = req.body.products[i];
        const product = await productTable.findOne({
          productname: productName,
        });
        // console.log("product: ", product);
        if(!product){
           return rc.setResponse(res, {
            data: productName,
            msg: `Product - ${productName} - not found in warehouse - ${fromwarehouse.warehouseName}.`,
          });
        }
        combinedData.push({
          productName: product._id,
          productQuantity: quantity,
          // fromWarehouse: fromwarehouse._id,
          // toWarehouse: towarehouse._id,
          // status: "Pending",
        });
      }

      // Create a single transfer request with all combined data
      const transferRequest = new WarehouseStockTransferRequest({
        fromWarehouse: fromwarehouse._id,
        toWarehouse: towarehouse._id,
        transferRequests: combinedData,
        status: "Pending",
      });
      await transferRequest.save();

      return rc.setResponse(res, {
        success: true,
        msg: "Combined stock transfer request sent.",
      });
    } catch (error) {
      console.log(error);
      return rc.setResponse(res, {
        error,
        msg: "Failed to send combined stock transfer request.",
      });
    }
  })
);

// sample file for bulk upload warehouseStock
router.get(
  "/warehouseStock/SampleCSV",
  auth,
  asyncHandler(async (req, res) => {
    // console.log("----------------xdxdxgxg--------");
    const query = {
      role: req.user.role,
    };
    // console.log(query);
    let cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    // console.log(cdata);
    if (cdata.updatebulkproduct) {
      const j = {
        fromWarehouse: "",
        toWarehouse: "",
        productName: "",
        quantity: "",
      };
      const csvFields = [
        "fromWarehouse",
        "toWarehouse",
        "productName",
        "quantity",
      ];
      const csvParser = new CsvParser({ csvFields });
      const csvdata = csvParser.parse(j);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=SampleImportwarehouseStock.csv"
      );
      res.status(200).end(csvdata);
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

//-------------------- Bulk upload warehouse to warehouse stock transfer -----------------------------------//
// /sendStockTransferRequest/ImportCSV

router.post(
  "/sendStockTransferRequest/ImportCSV",
  auth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const results = [];
    const rejectdata = [];
    const storeddata = [];

    function reject(x) {
      if (x) {
        rejectdata.push(x);
      }
    }

    function succ(x) {
      if (x) {
        storeddata.push(x);
      }
    }

    const query = { role: req.user.role };
    const cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);

    if (cdata.bulkproductupload) {
      const path = `public/${req.file.filename}`;
      const readStream = fs
        .createReadStream(path)
        .pipe(iconv.decodeStream("utf-8"))
        .pipe(iconv.encodeStream("utf-8"));

      readStream
        .pipe(csv({}))
        .on("data", async (data) => {
          // console.log("Raw data entry:", data);
          results.push(data);
        })
        .on("end", async () => {
          // console.log("results", results);
          // console.log("results", results.length);
          const transferRequests = [];

          for (let i = 0; i < results.length; i++) {
            if (
              results[i].fromWarehouse == "" ||
              results[i].fromWarehouse == "NA" ||
              results[i].fromWarehouse == "#N/A"
            ) {
              // console.log(`fromWarehouse is not available`);
              // console.log(results[i]);
              results[i].error = "fromWarehouse is missing";
              const r = reject(results[i]);
            } else if (
              results[i].toWarehouse == "" ||
              results[i].toWarehouse == "NA" ||
              results[i].toWarehouse == "#N/A"
            ) {
              // console.log(`toWarehouse is not available`);
              // console.log(results[i]);
              results[i].error = "toWarehouse is missing";
              const r = reject(results[i]);
            } else if (
              results[i].productName == "" ||
              results[i].productName == "NA" ||
              results[i].productName == "#N/A"
            ) {
              // console.log(`productName is not available`);
              // console.log(results[i]);
              results[i].error = "productName is missing";
              const r = reject(results[i]);
            } else if (
              results[i].quantity == "" ||
              results[i].quantity == "NA" ||
              results[i].quantity == "#N/A"
            ) {
              // console.log(`quantity is not available`);
              // console.log(results[i]);
              results[i].error = "quantity is missing";
              const r = reject(results[i]);
            }
            try {
              const sanitizedData = {
                fromWarehouse: replaceSpecialChars(results[i].fromWarehouse),
                toWarehouse: replaceSpecialChars(results[i].toWarehouse),
                productName: replaceSpecialChars(results[i].productName),
                quantity: replaceSpecialChars(results[i].quantity),
              };

              // console.log("Sanitized data entry:", sanitizedData);

              const fromwarehouse = await warehouseTable.findOne({
                wareHouseName: sanitizedData.fromWarehouse,
              });
              const towarehouse = await warehouseTable.findOne({
                wareHouseName: sanitizedData.toWarehouse,
              });
              const product = await productTable.findOne({
                productname: sanitizedData.productName,
              });
              const warehouse = await warehouseStock.findOne({
                warehouse: fromwarehouse._id,
              });

              if (
                !fromwarehouse ||
                !towarehouse ||
                !product
                // warehouse.productQuantity < sanitizedData.quantity
              ) {
                reject({ ...sanitizedData, error: "Invalid data" });
              } else {
                transferRequests.push({
                  fromWarehouse: fromwarehouse._id,
                  toWarehouse: towarehouse._id,
                  productName: product._id,
                  productQuantity: sanitizedData.quantity,
                  status: "Pending",
                });
                succ(sanitizedData);
              }
            } catch (e) {
              // console.log("Error processing data:", e);
              if (e.code === 11000) {
                reject({ ...sanitizedData, error: "Duplicate Entry" });
              } else {
                reject({ ...sanitizedData, error: e });
              }
            }
          }

          const newTransferRequest = new WarehouseStockTransferRequest({
            transferRequests: transferRequests,
            status: "Pending",
          });

          await newTransferRequest.save();

          // console.log("Stored data:", storeddata);
          // console.log("Rejected data:", rejectdata);

          const response = {
            success: true,
            msg: "Data Fetched",
            data: {
              stored_data: storeddata.length,
            },
          };

          if (rejectdata.length > 0) {
            response.data.dataupload = "partial upload";
            response.data.reject_data = rejectdata;
          } else {
            response.data.dataupload = "success";
          }

          return rc.setResponse(res, response);
        });
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

// function for replace character
// Replace '�' with space
function replaceSpecialChars(input) {
  return input.replace(/�/g, " "); // Replace '�' with space
}

// ----------------------------------------------------//

// acceptStock Transfer request of warehouse to warehouse

router.post(
  "/acceptStockTransferRequest/:requestId",
  auth,
  asyncHandler(async (req, res) => {
    const { requestId } = req.params;

    try {
      const transferRequest = await WarehouseStockTransferRequest.findById(
        requestId
      );
      // console.log("transferRequest", transferRequest);
      if (!transferRequest) {
        return res
          .status(404)
          .json({ error: "Stock transfer request not found." });
      }

      if (transferRequest.status === "Pending") {
        const fromWarehouseId = transferRequest.fromWarehouse; // Get the fromWarehouse ID
        // console.log("fromWarehouseId: ", fromWarehouseId);
        const toWarehouseId = transferRequest.toWarehouse; // Get the toWarehouse ID
        // console.log("toWarehouseId: ", toWarehouseId);
        const transferRequests = transferRequest.transferRequests;
        // console.log("transferRequests: ", transferRequests);

        // Update the stock quantities for each data entry
        for (let i = 0; i < transferRequests.length; i++) {
          const transferReq = transferRequests[i];
          const productNameId = transferReq.productName; // Get the product ID

          await warehouseStock.updateOne(
            {
              warehouse: fromWarehouseId,
              product: productNameId,
            },
            { $inc: { productQuantity: -transferReq.productQuantity } },
            { upsert: true } // Add this option
          );
          await warehouseStock.updateOne(
            {
              warehouse: toWarehouseId,
              product: productNameId,
            },
            { $inc: { productQuantity: transferReq.productQuantity } },
            { upsert: true } // Add this option
          );
        }

        //   // Update the status of the transfer request
        transferRequest.status = "Accepted";
        await transferRequest.save();
        return rc.setResponse(res, {
          success: true,
          msg: "Stock transfer request accepted.",
        });
      } else if (transferRequest.status === "Accepted") {
        return rc.setResponse(res, {
          success: false,
          msg: "Request already accepted",
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to accept stock transfer request." });
    }
  })
);

// get alltransfer stock request
// router.get(
//   "/alltransferRequest/Datalist",
//   auth,
//   asyncHandler(async (req, res) => {
//     const query = {
//       role: req.user.role,
//     };
//     let cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
//     if (cdata.listTransferStock) {
//       const data = await WarehouseStockTransferRequest.find({
//         isDeleted: false,
//       })
//         // .populate("fromWarehouse")
//         // .populate("toWarehouse")
//         // .populate("productName");
//         .populate("fromWarehouse", "wareHouseName")
//         .populate("toWarehouse", "wareHouseName")
//         .populate("transferRequests.productName");
//       // console.log('data: ', data);
//       // console.log("data", data);
//       let sendData = [];
//       // for (let i = 0; i < data.length; i++) {
//       //   sendData.push({
//       //     id: data[i]._id,
//       //     fromWarehouse: data[i].fromWarehouse.wareHouseName,
//       //     towarehouse: data[i].toWarehouse.wareHouseName,
//       //     product: data[i].productName.productname,
//       //     productQuantity: data[i].productQuantity,
//       //     status: data[i].status,
//       //   });
//       // }
//       for (let i = 0; i < data.length; i++) {
//         const transferRequests = data[i].transferRequests;
//         for (let j = 0; j < transferRequests.length; j++) {
//           sendData.push({
//             id: data[i]._id,
//             fromWarehouse: data[i].fromWarehouse
//               ? data[i].fromWarehouse.wareHouseName
//               : "N/A",
//             toWarehouse: data[i].towarehouse
//               ? data[i].toWarehouse.wareHouseName
//               : "N/A",
//             product: transferRequests[j].productName.productname,
//             productQuantity: transferRequests[j].productQuantity,
//             status: data[i].status,
//           });
//         }
//       }
//       if (data) {
//         return rc.setResponse(res, {
//           success: true,
//           msg: "Data fetched",
//           data: sendData,
//         });
//       } else {
//         return rc.setResponse(res, {
//           msg: "Data not found",
//         });
//       }
//       // console.log(sendData);
//     } else {
//       return rc.setResponse(res, { error: { code: 403 } });
//     }
//   })
// );

router.get(
  "/allTransferStockRequest",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    let permissions = await TableModelPermission.getDataByQueryFilterDataOne(
      query
    );
    if (permissions.listTransferStock) {
      const data = await WarehouseStockTransferRequest.find()
        .select("fromWarehouse toWarehouse status createdAt")
        .populate("fromWarehouse", "wareHouseName")
        .populate("toWarehouse", "wareHouseName");
      // console.log(data);

      const sendData = data.map((index) => ({
        _id: index._id,
        fromWarehouse: index?.fromWarehouse?.wareHouseName,
        toWarehouse: index?.toWarehouse?.wareHouseName,
        status: index.status,
        createdAt: helper.convertToTimeZone(index?.createdAt),
        // createdAt: index.createdAt.toLocaleString(),
      }));
      if (data) {
        return rc.setResponse(res, {
          success: true,
          data: sendData,
        });
      }
    }
  })
);

router.get(
  "/allTransferStockRequestbyid",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    let permissions = await TableModelPermission.getDataByQueryFilterDataOne(
      query
    );
    if (permissions.listTransferStock) {
      const data = await WarehouseStockTransferRequest.findOne({
        _id: req.query.id,
      })
        .select("fromWarehouse toWarehouse transferRequests status createdAt")
        .populate("fromWarehouse", "wareHouseName")
        .populate("toWarehouse", "wareHouseName")
        .populate("transferRequests.productName", "productname");
      // console.log(data);

      const sendData = {
        _id: data._id,
        fromWarehouse: data?.fromWarehouse?.wareHouseName,
        toWarehouse: data?.toWarehouse?.wareHouseName,
        products: data.transferRequests.map((request) => ({
          productName: request.productName.productname,
          productQuantity: request.productQuantity,
        })),
        status: data.status,
        // createdAt: data.createdAt.toLocaleString(),
        createdAt: helper.convertToTimeZone(data?.createdAt),
      };
      if (data) {
        return rc.setResponse(res, {
          success: true,
          data: sendData,
        });
      }
    }
  })
);

// New refiller request
// router.post(
//   "/refill/request",
//   auth,
//   asyncHandler(async (req, res) => {
//     try {
//       if (req.user.role == "Refiller" || req.user.role == "SuperAdmin") {
//         // console.log('req.body: ', req.body);
//         // console.log("req.body",req.body.machineSlot);
//         // console.log("returnitems:",req.body.returnItems);

//         const { machineId, machineSlot, date, sales } = req.body;
//         const refillerid = req.user.id;
//         // console.log(refillerid);
//         // Create the refill request in the database
//         const warehouseid = await machinedata.findOne({ _id: machineId });
//         // console.log("deletedSlots", req.body.deletedSlots);
//         // console.log("warehouseid", warehouseid);
//         let updatedSlots;
//         if (!req.body.returnItems) {
//           updatedSlots = null;
//         } else {
//           updatedSlots = req.body.returnItems;
//         }
//         let randomNumber = Math.floor(Math.random() * 100000000000000);
//         let data = new refillRequest({
//           refillerId: refillerid,
//           machineId: machineId,
//           warehouse: warehouseid.warehouse,
//           machineSlots: machineSlot,
//           returnItems: updatedSlots,
//           refillRequestNumber: randomNumber,
//           status: "Pending",
//           date: date,
//           sales: sales,
//         });
//         // console.log("data", data);
//         await data.save();
//         rc.setResponse(res, {
//           success: true,
//           message: "Refill request sent.",
//           data: data,
//         });
//       } else {
//         return rc.setResponse(res, { error: { code: 403 } });
//       }
//     } catch (error) {
//       console.log(error);
//       return res.status(500).json({ error: "Failed to send refill request." });
//     }
//   })
// );

// edit Refill Request
// router.put("/refill/request/:id", auth, asyncHandler(async(req,res)=> {
//   const data  = await refillRequest.findOne({id: req.params.id});
//   const updatedata = req.body;
//   if(data){
//     const update = await refillRequest.findOneAndUpdate(data, {} )
//   }
// }))

// router.delete(
//   "/refillrequest/:id",
//   auth,
//   asyncHandler(async (req, res) => {
//     if (req.user.role == "SuperAdmin" || req.user.role == "Admin") {
//       const deleteRequestId = req.params.id;
//       if (!deleteRequestId) {
//         return rc.setResponse(res, {
//           msg: "Missing refillRequestNumber parameter",
//         });
//       }
//       const deleteRequest = await refillRequest.findOneAndDelete({
//         refillRequestNumber: deleteRequestId,
//       });
//       if (!deleteRequest) {
//         return rc.setResponse(res, {
//           msg: "Request not found",
//         });
//       }
//       return rc.setResponse(res, {
//         success: true,
//         msg: "Request deleted",
//       });
//     } else {
//       return rc.setResponse(res, { error: { code: 403 } });
//     }
//   })
// );

const generateSalesReports = async (
  startDate,
  endDate,
  machineNameFilter,
  refillerNameFilter
) => {
  try {
    const salesReport = [];

    const queryFilters = {
      createdAt: { $gte: startDate, $lte: endDate },
      status: "Approved",
    };

    if (machineNameFilter) {
      const machine = await machinedata
        .findOne({ machinename: machineNameFilter })
        .select("_id machineid machinename");
      // console.log('machine: ', machine);
      if (machine) {
        queryFilters["machineId"] = machine._id;
      }
    }

    if (refillerNameFilter) {
      const refiller = await user_infos
        .findOne({ first_name: refillerNameFilter })
        .select("_id user_id first_name");
      if (refiller) {
        queryFilters["refillerId"] = refiller._id;
      }
    }

    const refillRequests = await Promise.resolve(
      refillRequest
        .find(queryFilters)
        .populate("machineId", "machinename")
        .populate("warehouse", "wareHouseName")
        .populate("refillerId", "first_name")
        .populate(
          "machineSlots.productid",
          "productname productid sellingprice"
        )
        .populate("returnItems.productid", "productname productid sellingprice")
    );

    for (const request of refillRequests) {
      for (const slot of request.machineSlots) {
        if (slot.saleQuantity > 0) {
          const product = slot.productid ? slot.productid : "";
          const machine = request.machineId;
          const warehouse = request.warehouse;
          const refiller = request.refillerId;
          // console.log('refiller: ', refiller);

          const saleEntry = {
            slot : slot.slot,
            productCode: product.productid ? product.productid : "NOPRODUCT",
            productName: product.productname
              ? product.productname
              : "NOPRODUCT",
            MRP: product.sellingprice,
            machineName: machine.machinename,
            warehouseName: warehouse.wareHouseName,
            refillerName: refiller.first_name,
            saleQuantity: slot.saleQuantity,
            date: request.createdAt,
          };
          salesReport.push(saleEntry);
        }
      }
      for (const slot of request.returnItems) {
        if (slot.saleQuantity > 0) {
          const product = slot.productid ? slot.productid : "";
          const machine = request.machineId;
          const warehouse = request.warehouse;
          const refiller = request.refillerId;
          // console.log('refiller: ', refiller);

          const saleEntry = {
            slot : slot.slot,
            productCode: product.productid ? product.productid : "NOPRODUCT",
            productName: product.productname
              ? product.productname
              : "NOPRODUCT",
            MRP: product.sellingprice,
            machineName: machine.machinename,
            warehouseName: warehouse.wareHouseName,
            refillerName: refiller.first_name,
            saleQuantity: slot.saleQuantity,
            date: request.createdAt,
          };
          salesReport.push(saleEntry);
        }
      }
    }

    return salesReport;
  } catch (error) {
    console.error("Error generating sales report:", error);
    return null;
  }
};

router.get(
  "/salesreport/exportCSV",
  validator.query(salesReport),
  // auth,
  asyncHandler(async (req, res) => {
    // const startDate = new Date("2023-08-01");
    // const endDate = new Date("2023-08-25");
    const startDate = req.query.start;
    const endDate = req.query.end;
    const machineNameFilter = req.query.machineNameFilter;
    const refillerNameFilter = req.query.refillerNameFilter;
    const salesReport = [];
    function pushData(x) {
      if (x) {
        salesReport.push(x);
      }
      return salesReport;
    }
    const data = await generateSalesReports(
      startDate,
      endDate,
      machineNameFilter,
      refillerNameFilter
    );
    // console.log("data",data)
    if (data) {
      for (let i = 0; i < data.length; i++) {
        const report = {
          slot: data[i].slot,
          productName: data[i].productName ? data[i].productName : "No Product",
          productCode: data[i].productCode ? data[i].productCode : "No Product",
          MRP: data[i].MRP,
          machineName: data[i].machineName,
          warehouseName: data[i].warehouseName,
          refillerName: data[i].refillerName,
          saleQuantity: data[i].saleQuantity,
          date: data[i].date.toLocaleString({ timezone: "Asia/Kolkata" }),
        };
        pushData(report);
      }
      const csvFields = [
        "slot",
        "productName",
        "productCode",
        "MRP",
        "machineName",
        "warehouseName",
        "refillerName",
        "saleQuantity",
        "date",
      ];
      const csvParser = new CsvParser({ csvFields });
      const csvData = csvParser.parse(salesReport);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=public/salesReport.csv"
      );
      return res.status(200).end(csvData);
    } else {
      res.status(404).json({ error: "Report not found" });
    }
    // return res.send(data);
  })
);

router.get(
  "/salesreport/groupby/exportCSV",
  validator.query(salesReport),
  // auth,
  asyncHandler(async (req, res) => {
    // const startDate = new Date("2023-08-01");
    // const endDate = new Date("2023-08-25");
    const startDate = req.query.start;
    const endDate = req.query.end;
    const machineNameFilter = req.query.machineNameFilter;
    const refillerNameFilter = req.query.refillerNameFilter;
    const salesReport = [];
    function pushData(x) {
      if (x) {
        salesReport.push(x);
      }
      return salesReport;
    }
    const data = await generateSalesReports(
      startDate,
      endDate,
      machineNameFilter,
      refillerNameFilter
    );
    // console.log("data",data)
    if (data) {
      const groupedData = Object.values(data.reduce((acc, item) => {
        const { productCode, productName, MRP, machineName,refillerName, warehouseName,saleQuantity } = item;
        if (!acc[productCode]) {
          acc[productCode] = { productCode, productName, MRP, machineName,refillerName, warehouseName,saleQuantity: 0 };
        }
        acc[productCode].saleQuantity += saleQuantity;
        return acc;
      }, {}));

      for (let i = 0; i < groupedData.length; i++) {
        const report = {
          productName: groupedData[i].productName ? data[i].productName : "No Product",
          productCode: groupedData[i].productCode ? data[i].productCode : "No Product",
          MRP: groupedData[i].MRP,
          machineName: groupedData[i].machineName,
          warehouseName: groupedData[i].warehouseName,
          refillerName: groupedData[i].refillerName,
          saleQuantity: groupedData[i].saleQuantity,
        };
        pushData(report);
      }
      const csvFields = [
        "productName",
        "productCode",
        "MRP",
        "machineName",
        "warehouseName",
        "refillerName",
        "totalsaleQuantity",
      ];
      const csvParser = new CsvParser({ csvFields });
      const csvData = csvParser.parse(salesReport);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=public/salesReportSummary.csv"
      );
      return res.status(200).end(csvData);
    } else {
      res.status(404).json({ error: "Report not found" });
    }
    // return res.send(data);
  })
);


router.get(
  "/salesreport",
  validator.query(salesReport),
  asyncHandler(async (req, res) => {
    const startDate = req.query.start;
    const endDate = req.query.end;
    const machineNameFilter = req.query.machineNameFilter;
    const refillerNameFilter = req.query.refillerNameFilter;
    const data = await generateSalesReports(
      startDate,
      endDate,
      machineNameFilter,
      refillerNameFilter
      );

    if (data) {
      return rc.setResponse(res, {
        success: true,
        msg: `Sales report from ${startDate} to ${endDate}`,
        data: data,
      });
    } else {
      return rc.setResponse(res, {
        success: false,
        data: "Report not found",
      });
    }
  })
);


// done
router.get(
  "/salesreport/groupby",
  validator.query(salesReport),
  asyncHandler(async (req, res) => {
    const startDate = req.query.start;
    const endDate = req.query.end;
    const machineNameFilter = req.query.machineNameFilter;
    const refillerNameFilter = req.query.refillerNameFilter;
    const data = await generateSalesReports(
      startDate,
      endDate,
      machineNameFilter,
      refillerNameFilter
      );

    if (data) {
      const groupedData = Object.values(data.reduce((acc, item) => {
        const { productCode, productName, MRP, machineName,refillerName, warehouseName,saleQuantity } = item;
        if (!acc[productCode]) {
          acc[productCode] = { productCode, productName, MRP, machineName,refillerName, warehouseName,saleQuantity: 0 };
        }
        acc[productCode].saleQuantity += saleQuantity;
        return acc;
      }, {}));
      groupedData.sort((a, b) => {
        if (a.productName < b.productName) {
          return -1;
        }
        if (a.productName > b.productName) {
          return 1;
        }
        return 0;
      });
      return rc.setResponse(res, {
        success: true,
        msg: `Sales report from ${startDate} to ${endDate}`,
        data: groupedData,
      });
    } else {
      return rc.setResponse(res, {
        success: false,
        data: "Report not found",
      });
    }
  })
);



module.exports = router;
