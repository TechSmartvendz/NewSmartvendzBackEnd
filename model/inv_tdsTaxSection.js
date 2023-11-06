const mongoose = require("mongoose");
const { Schema } = mongoose;
const autoIncrement = require("mongoose-sequence")(mongoose);

const inv_tdsTaxSection = new Schema(
  {
    section: { type: String, default: null, required: true, index: true },
    dummy: { type: String, default: "tdsTaxSection" },
    admin: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

inv_tdsTaxSection.set("toJSON");
inv_tdsTaxSection.set("toObject");

module.exports = mongoose.model("inv_tdsTaxSection", inv_tdsTaxSection);
