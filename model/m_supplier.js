const mongoose = require("mongoose");
const { Schema } = mongoose;

const supplier = new Schema(
  {
    supplierName: { type: String, default: null },
    supplierEmail: { type: String, default: null },
    supplierPhone: { type: Number, default: 0 },
    supplierAddress: { type: String, default: null },
    contactPerson: { type: String, default: null },
    area: { type: String, default: null },
    state: { type: String, default: null },
    city: { type: String, default: null },
    country: { type: String, default: null },
    pincode: { type: Number, default: 0 },
    // gstNumber: { type: Number, default: 0 },
    // panNumber: { type: String, default: null },
    admin: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

supplier.set("toJSON");
supplier.set("toObject");

module.exports = mongoose.model("supplier", supplier);

module.exports.addRow = async (newRow) => {
  const data = await newRow.save();
  return data;
};
