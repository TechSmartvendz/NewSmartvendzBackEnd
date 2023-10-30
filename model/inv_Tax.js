const mongoose = require("mongoose");
const { Schema } = mongoose;
const autoIncrement = require("mongoose-sequence")(mongoose);

const inv_Tax = new Schema(
  {
    taxId: { type: Number },
    code: { type: Number, default: 0 },
    hsn_Code: { type: String, default: hsnCode, unique: true },
    hsn_description: { type: String, default: null },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    cess: { type: Number, default: 0 },
    dummy: { type: String, default: "Tax" },
    admin: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

inv_Tax.set("toJSON");
inv_Tax.set("toObject");

inv_Tax.plugin(autoIncrement, { inc_field: "taxId" });

inv_Tax.pre("save", function (next) {
  if (!this.taxId) {
    return this.constructor
      .findOne()
      .sort("-taxId")
      .exec((err, lastDoc) => {
        if (err) {
          return next(err);
        }
        this.taxId = lastDoc ? lastDoc.taxId + 1 : 1;
        this.hsn_Code = hsnCode(this.code, this.taxId);
        next();
      });
  }

  this.hsn_Code = hsnCode(this.code, this.taxId);
  next();
});

function hsnCode(code, taxId) {
  return String(code + "-" + taxId);
}

module.exports = mongoose.model("inv_Tax", inv_Tax);
