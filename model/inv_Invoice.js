const mongoose = require("mongoose");
const { Schema } = mongoose;
const autoIncrement = require("mongoose-sequence")(mongoose);

const inv_Invoice = new Schema(
  {
    invoiceId: { type: Number },
    invoice: { type: String, default: "INV-", required: true, index: true },
    invoiceNumber: { type: String, default: null, required: true, index: true },
    orderNumber: { type: String, default: null },
    branch: { type: String, required: true, index: true },
    invoiceType: { type: String, required: true },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "inv_Customer",
      required: true,
      index: true,
    },
    invoiceDate: {
      type: Date,
      default: Date.now(),
      required: true,
      index: true,
    },
    term: { type: Schema.Types.ObjectId, ref: "inv_paymentTerm", index: true },
    dueDate: { type: Date, default: Date.now(), required: true, index: true },
    subject: { type: String, default: null },
    invProduct: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "inv_Product",
          index: true,
        },
        quantity: { type: Number },
        rate: { type: Number },
        disocunt: { type: Number },
        amount: { type: Number },
      },
    ],
    customerNotes: { type: String, default: null },
    // needs to update subtotal by adding tds
    subTotal: {
      subTotalPrice: { type: Number, default: 0 },
      tds: { type: Schema.Types.ObjectId, ref: "inv_TDS", index: true },
      adjustment: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    termsAndConditions: { type: String, default: null },
    currency: { type: String, default: null },
    createdDate: { type: Date, default: Date.now() },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "inv_User",
      require: true,
      default: this.admin,
    },
    status: {
      type: String,
      enum: ["Unpaid", "Paid", "Rejected"],
      default: "Unpaid",
    },
    dummy: { type: String, default: "Invoice" },
    admin: { type: String, required: true, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

inv_Invoice.set("toJSON");
inv_Invoice.set("toObject");

inv_Invoice.plugin(autoIncrement, { inc_field: "invoiceId" });

module.exports = mongoose.model("inv_Invoice", inv_Invoice);
