const mongoose = require("mongoose");
const { Schema } = mongoose;

const inv_Payment = new Schema(
  {
    // paymentId: { type: String, require: true, unique: true },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: "inv_Customer",
        // require: true,
        default: this.admin,
    },
    invoiceId: {
        type: Schema.Types.ObjectId,
        ref: "inv_Invoice",
        // require: true,
        default: this.admin,
    },
    paidAmount: { type: Number, default: 0 },//Total amount which he has paid till now
    status: { type: String, enum: ["Unpaid", "Paid", "Rejected"], default: "Unpaid" },
    createdDate: { type: Date, default: Date.now() },
    dummy: {type: String, default: "Payment"},
    admin: { type: String, required: true, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

inv_Payment.set("toJSON");
inv_Payment.set("toObject");

module.exports = mongoose.model("inv_Payment", inv_Payment);
