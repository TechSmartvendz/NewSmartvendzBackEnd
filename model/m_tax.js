const mongoose = require("mongoose");
const { Schema } = mongoose;

const tax = new Schema(
  {
    taxName: { type: String, default: null },
    taxRate: { type: Number, default: 0 },
    admin: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

tax.set("toJSON");
tax.set("toObject");

module.exports = mongoose.model("tax", tax);

module.exports.addRow = async (newRow) => {
  const data = await newRow.save();
  return data;
};
