const mongoose = require("mongoose");
const { Schema } = mongoose;

const warehouse = new Schema(
  {
    wareHouseName: { type: String, default: null },
    machine: { type: Schema.Types.ObjectId, ref: "machine" },
    email: { type: String, default: null },
    address: { type: String, default: null },
    state: { type: String, default: null },
    city: { type: String, default: null },
    country: { type: String, default: null },
    area: { type: String, default: null },
    phoneNumber: { type: Number, default: null },
    contactPerson: { type: String, default: null },
    pincode: { type: Number, default: null },
    admin: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

warehouse.set("toJSON");
warehouse.set("toObject");

module.exports = mongoose.model("warehouse", warehouse);

module.exports.addRow = async (newRow) => {
  const data = await newRow.save();
  return data;
};
