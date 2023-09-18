const mongoose = require("mongoose");

const WarehouseToWarehouseStockTransferRequest = new mongoose.Schema(
  {
    fromWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "warehouse",
    },
    toWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "warehouse",
    },
    transferRequests: [
      {
        productName: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
        productQuantity: { type: Number, default: 0, minimum: 0 },
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
    isDeleted: { type: Boolean, default: false },
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
