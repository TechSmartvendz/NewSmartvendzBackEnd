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
const machine = require("../model/m_machine_slot");
const warehouseToMachineStockTransferRequest = require("../model/m_warehouseToMachine_Stock_TransferRequest");
const refillRequest = require("../model/m_refiller_request");
const machinedata = require("../model/m_machine");

const CsvParser = require("json2csv").Parser;
const csv = require("csv-parser");
const fs = require("fs");
const { upload } = require("../middleware/fileUpload");

// sendStockTransferRequest to warehouse
router.post(
  "/sendStockTransferRequest",
  auth,
  asyncHandler(async (req, res) => {
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
      // console.log(warehouse.productQuantity);
      if (warehouse.productQuantity < quantity) {
        return rc.setResponse(res, {
          success: false,
          msg: "warehouse has less quantity",
        });
      }
      const transferRequest = new WarehouseStockTransferRequest({
        fromWarehouse: fromwarehouse._id,
        toWarehouse: towarehouse._id,
        productName: product._id,
        productQuantity: quantity,
        status: "Pending",
      });
      await transferRequest.save();
      return rc.setResponse(res, {
        success: true,
        msg: "Stock transfer request sent.",
        // data: d
      });
    } catch (error) {
      return rc.setResponse(res, {
        error,
        msg: "Failed to send stock transfer request.",
      });
    }
  })
);

// sample file for bulk upload warehouseStock
router.get(
  "/warehouseStock/SampleCSV",
  auth,
  asyncHandler(async (req, res) => {
    console.log("----------------xdxdxgxg--------");
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

// router.post(
//   "/sendStockTransferRequest/BulkUpload",
//   auth,
//   upload.single("file"),
//   asyncHandler(async (req, res) => {
//     if (!req.files || !req.files.csvFile) {
//       return rc.setResponse(res, {
//         success: false,
//         msg: "CSV file not provided.",
//       });
//     }

//     const file = req.files.csvFile;

//     try {
//       const bulkUploadResults = [];

//       fs.createReadStream(file.tempFilePath)
//         .pipe(csv())
//         .on("data", async (row) => {
//           const { fromWarehouse, toWarehouse, productName, quantity } = row;

//           // Perform any necessary validation or business logic here before creating the request

//           // Create a new stock transfer request in the database
//           const fromwarehouse = await warehouseTable.findOne({
//             wareHouseName: fromWarehouse,
//           });
//           const towarehouse = await warehouseTable.findOne({
//             wareHouseName: toWarehouse,
//           });
//           const product = await productTable.findOne({ productname: productName });
//           const warehouse = await warehouseStock.findOne({
//             warehouse: fromwarehouse._id,
//           });

//           if (warehouse.productQuantity < quantity) {
//             bulkUploadResults.push({
//               success: false,
//               msg: "Warehouse has less quantity for the transfer request.",
//             });
//           } else {
//             // Create a new stock transfer request in the database
//             const transferRequest = new WarehouseStockTransferRequest({
//               fromWarehouse: fromwarehouse._id,
//               toWarehouse: towarehouse._id,
//               productName: product._id,
//               productQuantity: quantity,
//               status: "Pending",
//             });

//             await transferRequest.save();
//             bulkUploadResults.push({
//               success: true,
//               msg: "Stock transfer request sent.",
//             });
//           }
//         })
//         .on("end", () => {
//           return rc.setResponse(res, {
//             success: true,
//             msg: "Bulk stock transfer requests sent.",
//             data: bulkUploadResults,
//           });
//         });
//     } catch (error) {
//       return rc.setResponse(res, {
//         error,
//         msg: "Failed to send bulk stock transfer requests.",
//       });
//     }
//   })
// );

// new bulk upload warehouse stock

router.post(
  "/sendStockTransferRequest/ImportCSV",
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
              results[i].fromWarehouse == "" ||
              results[i].fromWarehouse == "NA" ||
              results[i].fromWarehouse == "#N/A"
            ) {
              console.log(`fromWarehouse is not available`);
              console.log(results[i]);
              results[i].error = "fromWarehouse is missing";
              const r = reject(results[i]);
            } else if (
              results[i].toWarehouse == "" ||
              results[i].toWarehouse == "NA" ||
              results[i].toWarehouse == "#N/A"
            ) {
              console.log(`toWarehouse is not available`);
              console.log(results[i]);
              results[i].error = "toWarehouse is missing";
              const r = reject(results[i]);
            } else if (
              results[i].productName == "" ||
              results[i].productName == "NA" ||
              results[i].productName == "#N/A"
            ) {
              console.log(`productName is not available`);
              console.log(results[i]);
              results[i].error = "productName is missing";
              const r = reject(results[i]);
            } else if (
              results[i].quantity == "" ||
              results[i].quantity == "NA" ||
              results[i].quantity == "#N/A"
            ) {
              console.log(`quantity is not available`);
              console.log(results[i]);
              results[i].error = "quantity is missing";
              const r = reject(results[i]);
            } else {
              try {
                const fromwarehouse = await warehouseTable.findOne({
                  wareHouseName: results[i].fromWarehouse,
                });
                const towarehouse = await warehouseTable.findOne({
                  wareHouseName: results[i].toWarehouse,
                });
                const product = await productTable.findOne({
                  productname: results[i].productName,
                });
                const warehouse = await warehouseStock.findOne({
                  warehouse: fromwarehouse._id,
                });

                if (warehouse.productQuantity < results[i].quantity) {
                  return rc.setResponse(res, {
                    success: false,
                    msg: "warehouse has less quantity",
                  });
                }

                let newRow = {
                  fromWarehouse: fromwarehouse._id,
                  toWarehouse: towarehouse._id,
                  productName: product._id,
                  productQuantity: results[i].quantity,
                  status: "Pending",
                };
                const newData = await WarehouseStockTransferRequest(newRow);
                await newData.save();
                if (newData) {
                  const r = succ(results[i]);
                }
              } catch (e) {
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
          // const r= reject();
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

// ----------------------------------------------------//

// acceptStock Tra nsfer request of warehouse to warehouse
router.post(
  "/acceptStockTransferRequest/:requestId",
  auth,
  asyncHandler(async (req, res) => {
    const { requestId } = req.params;

    try {
      const transferRequest = await WarehouseStockTransferRequest.findById(
        requestId
      );
      if (!transferRequest) {
        return res
          .status(404)
          .json({ error: "Stock transfer request not found." });
      }
      if (transferRequest.status === "Pending") {
        await warehouseStock.updateOne(
          {
            warehouse: transferRequest.fromWarehouse,
            product: transferRequest.productName,
          },
          { $inc: { productQuantity: -transferRequest.productQuantity } }
        );
        await warehouseStock.updateOne(
          {
            warehouse: transferRequest.toWarehouse,
            product: transferRequest.productName,
          },
          { $inc: { productQuantity: transferRequest.productQuantity } },
          { upsert: true }
        );

        // Update the status of the transfer request
        transferRequest.status = "Accepted";
        await transferRequest.save();
        return rc.setResponse(res, {
          success: true,
          msg: "Stock transfer request accepted.",
        });
      } else if (transferRequest.status === "Accepted") {
        return rc.setResponse(res, {
          success: false,
          msg: "request already accepted",
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
router.get(
  "/alltransferRequest/Datalist",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    let cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.listTransferStock) {
      const data = await WarehouseStockTransferRequest.find({
        isDeleted: false,
      })
        .populate("fromWarehouse")
        .populate("toWarehouse")
        .populate("productName");
      // console.log("data", data);
      let sendData = [];
      for (let i = 0; i < data.length; i++) {
        sendData.push({
          id: data[i]._id,
          fromWarehouse: data[i].fromWarehouse.wareHouseName,
          towarehouse: data[i].toWarehouse.wareHouseName,
          product: data[i].productName.productname,
          productQuantity: data[i].productQuantity,
          status: data[i].status,
        });
      }
      if (data) {
        return rc.setResponse(res, {
          success: true,
          msg: "Data fetched",
          data: sendData,
        });
      } else {
        return rc.setResponse(res, {
          msg: "Data not found",
        });
      }
      // console.log(sendData);
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

// warehouse to machine transfer request
// router.post(
//   "/sendStockTransfertoMachineRequest",
//   auth,
//   asyncHandler(async (req, res) => {
//     const { fromWarehouseId, toMachineId, productId, quantity } = req.body;

//     try {
//       // Perform any necessary validation or business logic here before creating the request

//       // Create a new stock transfer request in the database
//       const transferRequest = new warehouseToMachineStockTransferRequest({
//         fromWarehouseId,
//         toMachineId,
//         productId,
//         quantity,
//         status: "Pending", // You can set an initial status for the request, such as 'Pending'
//       });
//       await transferRequest.save();

//       res.status(200).json({ message: "Stock transfer request sent." });
//     } catch (error) {
//       res.status(500).json({ error: "Failed to send stock transfer request." });
//     }
//   })
// );

// accept stock transfer request of warehouse to machines
// router.post(
//   "/acceptstocktranferfromwarehousetomachine/:requestId",
//   auth,
//   asyncHandler(async (req, res) => {
//     const { requestId } = req.params;

//     try {
//       // Find the stock transfer request in the database
//       const transferRequest =
//         await warehouseToMachineStockTransferRequest.findById(requestId);

//       if (!transferRequest) {
//         return res
//           .status(404)
//           .json({ error: "Stock transfer request not found." });
//       }

//       // Perform any additional validation or business logic here before updating the stock

//       // Update the stock in the machine
//       if (transferRequest.status == "Pending") {
//         await machine.updateOne(
//           {
//             machineId: transferRequest.toMachineId,
//             productId: transferRequest.productId,
//           },
//           { $inc: { closingStock: transferRequest.quantity } },
//           { upsert: true }
//         );

//         // Update the stock in the warehouse
//         await warehouseStock.updateOne(
//           {
//             warehouseId: transferRequest.warehouseId,
//             productId: transferRequest.productId,
//           },
//           { $inc: { productQuantity: -transferRequest.quantity } }
//         );

//         // Update the status of the transfer request
//         transferRequest.status = "Accepted";
//         await transferRequest.save();

//         // res.status(200).json({ message: "Stock transfer request accepted." });
//         return rc.setResponse(res, {
//           success: true,
//           msg: "Stock transfer to machine request accepted",
//         });
//       } else if (transferRequest.status === "Accepted") {
//         return rc.setResponse(res, {
//           success: false,
//           msg: "request already accepted",
//         });
//       }
//     } catch (error) {
//       res
//         .status(500)
//         .json({ error: "Failed to accept stock transfer request." });
//     }
//   })
// );

// New refiller request
router.post(
  "/refill/request",
  auth,
  asyncHandler(async (req, res) => {
    try {
      if (req.user.role == "Refiller" || req.user.role == "SuperAdmin") {
        // console.log('req.body: ', req.body);
        // console.log("req.body",req.body.machineSlot);
        // console.log("returnitems:",req.body.returnItems);

        const { machineId,machineSlot,date, sales } = req.body;
        const refillerid = req.user.id;
        // console.log(refillerid);
        // Create the refill request in the database
        const warehouseid = await machinedata.findOne({ _id: machineId });
        // console.log("deletedSlots", req.body.deletedSlots);
        // console.log("warehouseid", warehouseid);
        let updatedSlots;
        if (!req.body.returnItems) {
          updatedSlots = null;
        } else {
          updatedSlots = req.body.returnItems;
        }
        let randomNumber = Math.floor(Math.random() * 100000000000000);
        let data = new refillRequest({
          refillerId: refillerid,
          machineId: machineId,
          warehouse: warehouseid.warehouse,
          machineSlots: machineSlot,
          returnItems: updatedSlots,
          refillRequestNumber: randomNumber,
          status: "Pending",
          date: date,
          sales: sales
        });
        // console.log("data", data);
        await data.save();
        rc.setResponse(res, {
          success: true,
          message: "Refill request sent.",
          data: data,
        });
      } else {
        return rc.setResponse(res, { error: { code: 403 } });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Failed to send refill request." });
    }
  })
);

router.delete(
  "/refillrequest/:id",
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role == "SuperAdmin" || req.user.role == "Admin") {
      const deleteRequestId = req.params.id;
      if (!deleteRequestId) {
        return rc.setResponse(res, {
          msg: "Missing refillRequestNumber parameter",
        });
      }
      const deleteRequest = await refillRequest.findOneAndDelete({
        refillRequestNumber: deleteRequestId,
      });
      if (!deleteRequest) {
        return rc.setResponse(res, {
          msg: "Request not found",
        });
      }
      return rc.setResponse(res, {
        success: true,
        msg: "Request deleted",
      });
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

module.exports = router;
