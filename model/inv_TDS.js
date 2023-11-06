const mongoose = require("mongoose");
const { Schema } = mongoose;
const autoIncrement = require("mongoose-sequence")(mongoose);

const inv_TDS = new Schema(
  {
    tdsName: { type: String, default: null, required: true, index: true },
    tdsRate: {
      type: Number,
      default: null,
      required: true,
      index: true,
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: "inv_tdsTaxSection",
      index: true,
    },
    dummy: { type: String, default: "TDS" },
    admin: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

inv_TDS.set("toJSON");
inv_TDS.set("toObject");

module.exports = mongoose.model("inv_TDS", inv_TDS);
