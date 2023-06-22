const mongoose = require("mongoose");
const { Schema } = mongoose;

const refillrequest = new Schema(
  {
    refillerID: { type: Schema.Types.ObjectId, ref: "user_info", require: true  },
    refillRequestNumber: { type: String, default: false, unique: true },
    machineId: { type: String, default: false },
    machineSlot: [
      {
        slot: { type: String, default: false },
        closingStock: { type: Number, default: 0 },
        currentStock: { type: Number, default: 0 },
        refillQuantity: { type: Number, default: 0 },
        saleQuantity: { type: Number, default: 0 },
        materialName: { type: String, default: false },
        slotid: {type: String, default: false}
      },
    ],
    oldmachineData: [{ type: String, default: false }],
    pendingstatus: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

refillrequest.set("toJSON");
refillrequest.set("toObject");

module.exports = mongoose.model("refillrequest", refillrequest);
