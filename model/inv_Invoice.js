const mongoose = require("mongoose");
const { Schema } = mongoose;
const autoIncrement = require("mongoose-sequence")(mongoose);

const inv_Invoice = new Schema(
  {
    invoiceId: { type: Number },
    invoiceCode: { type: String, default: invoiceId, unique: true },
    invoiceNumber: { type: String, default: null, unique: true, index: true },
    orderNumber: { type: String, default: null, unique: true, index: true },
    invoiceType: { type: String, require: true },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "inv_Customer",
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
    customerNotes: { type: String, defaut: null },
    totalAmount: { type: Number, default: null },
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

inv_Invoice.pre("save", function (next) {
  if (!this.invoiceId) {
    return this.constructor
      .findOne()
      .sort("-invoiceId")
      .exec((err, lastDoc) => {
        if (err) {
          return next(err);
        }
        this.invoiceId = lastDoc ? lastDoc.invoiceId + 1 : 1;
        this.invoiceCode = invoiceId(this.invoiceNumber, this.invoiceId);
        next();
      });
  }

  this.invoiceCode = invoiceId(this.invoiceNumber, this.invoiceId);
  next();
});

function invoiceId(invoiceNumber, invoiceId) {
  return String(invoiceNumber + "-" + invoiceId);
}

module.exports = mongoose.model("inv_Invoice", inv_Invoice);
