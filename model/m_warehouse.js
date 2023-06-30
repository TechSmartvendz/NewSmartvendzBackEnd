const mongoose = require("mongoose");
const { Schema } = mongoose;

const warehouse = new Schema(
  {
    wareHouseName: { type: String, default: false },
    email: { type: String, default: false },
    address: { type: String, default: false },
    state: { type: String, default: false },
    city: { type: String, default: false },
    country: { type: String, default: false },
    area: { type: String, default: false },
    phoneNumber: { type: String, default: false },
    contactPerson: { type: String, default: false },
    pincode: { type: String, default: false },
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
