const mongoose = require("mongoose");
const { Schema } = mongoose;

const warehouseStock = new Schema(
  {
    wareHouseId: { type: Schema.Types.ObjectId, ref: "warehouse" },
    productName: { type: String, default: false },
    productQuantity: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    invoiceNumber: { type: Number, default: 0 },
    GRN_Number: { type: Number, default: 0 },
    admin: { type: String, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

warehouseStock.set("toJSON");
warehouseStock.set("toObject");

module.exports = mongoose.model("warehouseStock", warehouseStock);

module.exports.addRow = async (newRow) => {
    const data = await newRow.save();
    return data;
  };
  