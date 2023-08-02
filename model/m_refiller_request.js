const mongoose = require("mongoose");
const { Schema } = mongoose;

const refillrequest = new Schema(
  {
    refillerID: {
      type: Schema.Types.ObjectId,
      ref: "user_info",
      require: true,
    },
    warehouse: { type: String, default: null, required: true },
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
    updatedSlots: [
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
    // oldmachineData: [{ type: String, default: null }],
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
