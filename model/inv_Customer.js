const mongoose = require("mongoose");
const { Schema } = mongoose;

const inv_Customer = new Schema(
  {
    customerType: { type: String, require: true },
    customerName: { type: String, require: true, default: null },
    companyName: { type: String, default: null },
    customerDisplayName: { type: String, default: null },
    customerEmail: { type: String, default: null, index: true },
    customerPhone: [{ type: Number, default: null }],
    gstTreatment: { type: String, default: null },
    panNumber: { type: String, default: null },
    placeOfSupply: { type: String, default: null },
    taxPreference: { type: String, required: true, default: "Taxable" },
    currency: { type: String, default: null },
    paymentTerm: {
      type: Schema.Types.ObjectId,
      ref: "inv_paymentTerm",
      index: true,
    },
    openingBalance: { type: Number, default: 0 },
    paidAmount: { type: Number },
    billingAddress: {
      attention: { type: String },
      country: { type: String },
      address: [
        {
          type: String,
        },
      ],
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      phone: { type: String },
      faxNumber: { type: String },
    },
    shippingAddress: {
      attention: { type: String },
      country: { type: String },
      address: [
        {
          type: String,
        },
      ],
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      phone: { type: String },
      faxNumber: { type: String },
    },
    contactPerson: [
      {
        firstName: { type: String },
        lastName: { type: String },
        email: { type: String },
        phone: { type: Number },
        mobile: { type: Number },
        designation: { type: String },
        department: { type: String },
      },
    ],
    remarks: { type: String },
    createdDate: { type: Date, default: Date.now() },
    dummy: { type: String, default: "Customer" },
    admin: { type: String, required: true, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

inv_Customer.set("toJSON");
inv_Customer.set("toObject");

module.exports = mongoose.model("inv_Customer", inv_Customer);
