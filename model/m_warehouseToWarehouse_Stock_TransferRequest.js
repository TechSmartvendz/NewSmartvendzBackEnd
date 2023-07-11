const mongoose = require("mongoose");

const WarehouseToWarehouseStockTransferRequest = new mongoose.Schema(
  {
    fromWarehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "warehouseStock",
    },
    toWarehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "warehouseStock",
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

const warehousetowarehouseStockTransferRequest = mongoose.model(
  "warehouseToWarehouseStockTransferRequest",
  WarehouseToWarehouseStockTransferRequest
);

module.exports = warehousetowarehouseStockTransferRequest;
