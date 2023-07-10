const mongoose = require("mongoose");

const WarehouseStockTransferRequest = new mongoose.Schema(
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

const warehouseStockTransferRequest = mongoose.model(
  "warehouseStockTransferRequest",
  WarehouseStockTransferRequest
);

module.exports = warehouseStockTransferRequest;
