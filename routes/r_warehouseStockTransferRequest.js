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
      // console.log(req.body);
      const { machineId, machineSlot } = req.body.machine;
      const refillerid = req.user.id;
      // Create the refill request in the database
      const warehouseid = await machinedata.findOne({ _id: machineId });
      // console.log("deletedSlots", req.body.deletedSlots);
      // console.log("warehouseid", warehouseid);
      let updatedSlots;
      if (!req.body.deletedSlots) {
        updatedSlots = null;
      } else {
        updatedSlots = req.body.deletedSlots.machineSlot;
      }
      let randomNumber = Math.floor(Math.random() * 100000000000000);
      let data = new refillRequest({
        refillerId: refillerid,
        machineId: machineId,
        warehouse: warehouseid.warehouse,
        machineSlots: machineSlot,
        updatedSlots: updatedSlots,
        refillRequestNumber: randomNumber,
        status: "Pending",
      });
      // console.log("data", data);
      await data.save();
      rc.setResponse(res, {
        success: true,
        message: "Refill request sent.",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Failed to send refill request." });
    }
  })
);

module.exports = router;
