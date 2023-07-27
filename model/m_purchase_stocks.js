const mongoose = require("mongoose");
const { Schema } = mongoose;

const purchaseStocks = new Schema(
  {
    warehouse: { type: Schema.Types.ObjectId, ref: "warehouse" },
    product: { type: Schema.Types.ObjectId, ref: "product" },
    supplier: { type: Schema.Types.ObjectId, ref: "supplier" },
    productQuantity: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    invoiceNumber: { type: Number, default: 0 },
    GRN_Number: { type: Number, default: 0 },
    gst: { type: Schema.Types.ObjectId, ref: "m_gst" },
    date: { type: Date, default: null, require: true },
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
