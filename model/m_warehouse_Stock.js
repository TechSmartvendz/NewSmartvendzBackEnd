const mongoose = require("mongoose");
const { Schema } = mongoose;

const warehouseStock = new Schema(
  {
    warehouse: { type: String, default: null, required: true },
    product: { type: String, default: null, required: true },
    // wareHouseId: { type: String, default: null },
    // productId: { type: String, default: null },
    productQuantity: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    admin: { type: String, default: null },
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
