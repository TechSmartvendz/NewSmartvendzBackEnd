const mongoose = require("mongoose");
const { Schema } = mongoose;

const gst = new Schema(
  {
    gstName: { type: String, default: null },
    gstRate: { type: Number, default: 0 },
    // hsnNumber:{ type: Number, default: 0 },
    // igst: { type: Number, default: 0 },
    // cgst: { type: Number, default: 0 },
    // sgst: { type: Number, default: 0 },
    // cess: { type: Number, default: 0 },
    admin: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

gst.set("toJSON");
gst.set("toObject");

module.exports = mongoose.model("gst", gst);

module.exports.addRow = async (newRow) => {
  const data = await newRow.save();
  return data;
};
