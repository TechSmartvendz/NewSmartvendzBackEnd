const mongoose = require("mongoose");
const { Schema } = mongoose;

const purchaseStocks = new Schema(
  {
    warehouse: { type: String, required: true, default: null },
    product: { type: String, required: true, default: null },
    supplier: { type: String, required: true, default: null },
    productQuantity: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    invoiceNumber: { type: Number, default: 0 },
    GRN_Number: { type: Number, default: 0 },
    admin: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

purchaseStocks.set("toJSON");
purchaseStocks.set("toObject");

module.exports = mongoose.model("purchaseStocks", purchaseStocks);

module.exports.addRow = async (newRow) => {
  const data = await newRow.save();
  return data;
};
