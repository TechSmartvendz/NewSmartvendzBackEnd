const express = require("express");
const router = express.Router();

const rc = require("../controllers/responseController");
const { asyncHandler } = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");

const warehouseStock = require("../model/m_warehouse_Stock");
const WarehouseStockTransferRequest = require("../model/m_warehouseToWarehouse_Stock_TransferRequest");
const machine = require("../model/m_machine_slot");
const warehouseToMachineStockTransferRequest = require("../model/m_warehouseToMachine_Stock_TransferRequest");

// sendStockTransferRequest to warehouse
router.post(
  "/sendStockTransferRequest",
  auth,
  asyncHandler(async (req, res) => {
    const { fromWarehouseId, toWarehouseId, productId, quantity } = req.body;
    try {
      // Perform any necessary validation or business logic here before creating the request

      // Create a new stock transfer request in the database
      const warehouse = await warehouseStock.findOne({
        warehouse: fromWarehouseId,
      });
      console.log(warehouse.productQuantity);
      if (warehouse.productQuantity < quantity) {
        return rc.setResponse(res, {
          success: false,
          msg: "warehouse has less quantity",
        });
      }
      const transferRequest = new WarehouseStockTransferRequest({
        fromWarehouseId,
        toWarehouseId,
        productId,
        quantity,
        status: "Pending",
      });
      await transferRequest.save();

      res.status(200).json({ message: "Stock transfer request sent." });
    } catch (error) {
      res.status(500).json({ error: "Failed to send stock transfer request." });
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
            warehouse: transferRequest.fromWarehouseId,
            product: transferRequest.productId,
          },
          { $inc: { productQuantity: -transferRequest.quantity } }
        );
        await warehouseStock.updateOne(
          {
            warehouse: transferRequest.toWarehouseId,
            product: transferRequest.productId,
          },
          { $inc: { productQuantity: transferRequest.quantity } },
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

// warehouse to machine transfer request
router.post(
  "/sendStockTransfertoMachineRequest",
  auth,
  asyncHandler(async (req, res) => {
    const { fromWarehouseId, toMachineId, productId, quantity } = req.body;

    try {
      // Perform any necessary validation or business logic here before creating the request

      // Create a new stock transfer request in the database
      const transferRequest = new warehouseToMachineStockTransferRequest({
        fromWarehouseId,
        toMachineId,
        productId,
        quantity,
        status: "Pending", // You can set an initial status for the request, such as 'Pending'
      });
      await transferRequest.save();

      res.status(200).json({ message: "Stock transfer request sent." });
    } catch (error) {
      res.status(500).json({ error: "Failed to send stock transfer request." });
    }
  })
);

// accept stock transfer request of warehouse to machines
router.post(
  "/acceptstocktranferfromwarehousetomachine/:requestId", auth,
  asyncHandler(async (req, res) => {
    const { requestId } = req.params;

    try {
      // Find the stock transfer request in the database
      const transferRequest = await warehouseToMachineStockTransferRequest.findById(
        requestId
      );

      if (!transferRequest) {
        return res
          .status(404)
          .json({ error: "Stock transfer request not found." });
      }

      // Perform any additional validation or business logic here before updating the stock

      // Update the stock in the machine
      if(transferRequest.status == "Pending"){

          await machine.updateOne(
              {
                  machineId: transferRequest.toMachineId,
          productId: transferRequest.productId,
        },
        { $inc: { closingStock: transferRequest.quantity } },
        { upsert: true }
        );
        
        // Update the stock in the warehouse
        await warehouseStock.updateOne(
            {
                warehouseId: transferRequest.warehouseId,
                productId: transferRequest.productId,
            },
            { $inc: { productQuantity: - transferRequest.quantity } }
            );
            
            // Update the status of the transfer request
            transferRequest.status = "Accepted";
            await transferRequest.save();
            
            // res.status(200).json({ message: "Stock transfer request accepted." });
            return rc.setResponse(res, {
                success: true,
                msg: "Stock transfer to machine request accepted"
            })
        }
        else if(transferRequest.status === "Accepted"){
            return rc.setResponse(res, {
                success: false,
                msg: "request already accepted"
            })
        }
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to accept stock transfer request." });
    }
  })
);

module.exports = router;
