const mongoose = require("mongoose");
const { Schema } = mongoose;

const inv_paymentTerm = new Schema(
  {
    // paymentTermId: { type: String, require: true, unique: true },
    paymentTermId: { type: String},
    paymentTermName: {type: String, require: true, unique: true},
    paymentTerm: {type: Number, require: true, default: 0},
    createdDate: { type: Date, default: Date.now() },
    dummy: {type: String, default: "PaymentTerm"},
    admin: { type: String, required: true, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

inv_paymentTerm.set("toJSON");
inv_paymentTerm.set("toObject");

module.exports = mongoose.model("inv_paymentTerm", inv_paymentTerm);
