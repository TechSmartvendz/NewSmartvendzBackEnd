const mongoose = require("mongoose");
const { Schema } = mongoose;

const inv_Unit = new Schema(
  {
    name: { type: String, required: true },
    unit: { type: String, unique: true, required: true },
    admin: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

inv_Unit.set("toJSON");
inv_Unit.set("toObject");

module.exports = mongoose.model("inv_Unit", inv_Unit);
