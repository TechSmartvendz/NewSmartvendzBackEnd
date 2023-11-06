const mongoose = require("mongoose");
const { Schema } = mongoose;

const inv_Product = new Schema(
  {
    productId: { type: String, require: true, unique: true },
    productType: { type: String, default: "Goods", require: true },
    productName: { type: String, require: true, unique: true, trim: true },
    unit: { type: String, default: null },
    sellingPrice: { type: Number, default: 0 },
    sellingAccount: { type: String, default: null },
    salesDescription: { type: String, default: null },
    costPrice: { type: Number, default: 0 },
    costAccount: { type: String, default: null },
    purchaseDescription: { type: String, default: null },
    preferredVendor: { type: String, default: null },
    tax: {
      type: Schema.Types.ObjectId,
      ref: "inv_Tax",
      index: true,
    },
    SKU: { type: String, default: null },
    taxPreference: { type: String, default: null },
    createdDate: { type: Date, default: Date.now() },
    createdBy: { type: String, require: true, default: this.admin },
    updatedBy: { type: String, require: true, default: this.admin },
    dummy: { type: String, default: "Product" },
    admin: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

inv_Product.set("toJSON");
inv_Product.set("toObject");

module.exports = mongoose.model("inv_Product", inv_Product);
