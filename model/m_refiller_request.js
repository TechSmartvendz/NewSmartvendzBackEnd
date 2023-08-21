const mongoose = require("mongoose");
const { Schema } = mongoose;

const refillrequest = new Schema(
  {
    refillerId: {
      type: Schema.Types.ObjectId,
      ref: "user_info",
      require: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "warehouse",
      required: true,
    },
    refillRequestNumber: { type: String, default: null, unique: true },
    machineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "machine",
      required: true,
    },
    machineSlots: [
      {
        slot: { type: String, default: false },
        closingStock: { type: Number, default: 0 },
        currentStock: { type: Number, default: 0 },
        refillQuantity: { type: Number, default: 0 },
        saleQuantity: { type: Number, default: 0 },
        productid: { type: Schema.Types.ObjectId, ref: "product" },
        sloteid: { type: String, default: false },
      },
    ],
    returnItems: [
      {
        slot: { type: String, default: false },
        closingStock: { type: Number, default: 0 },
        currentStock: { type: Number, default: 0 },
        refillQuantity: { type: Number, default: 0 },
        saleQuantity: { type: Number, default: 0 },
        productid: { type: Schema.Types.ObjectId, ref: "product" },
        sloteid: { type: String, default: false },
      },
    ],
    date: { type: Date, default: null },
    cash: { type: Number, default: 0 },
    totalSalesCount: { type: Number, default: 0 },
    salesValue: { type: Number, default: 0 },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"] },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

refillrequest.set("toJSON");
refillrequest.set("toObject");

module.exports = mongoose.model("refillrequest", refillrequest);
