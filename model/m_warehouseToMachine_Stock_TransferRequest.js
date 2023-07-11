const mongoose = require("mongoose");

const WarehouseToMachineStockTransferRequest = new mongoose.Schema(
  {
    fromWarehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "warehouseStock",
    },
    toMachineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "machine_slot",
    },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
    quantity: { type: Number, default: 0, minimum: 0 },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const warehousetomachineStockTransferRequest = mongoose.model(
  "warehouseToMachineStockTransferRequest",
  WarehouseToMachineStockTransferRequest
);

module.exports = warehousetomachineStockTransferRequest;
