const mongoose = require("mongoose");
const { Schema } = mongoose;

const m_gst = new Schema(
  {
    hsn_Code:{ type: Number, default: 0 },
    hsn_description: { type: String, default: null},
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    cess: { type: Number, default: 0 },
    admin: { type: String, required: true },
    isDeleted: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);

m_gst.set("toJSON");
m_gst.set("toObject");

module.exports = mongoose.model("m_gst", m_gst);

module.exports.addRow = async (newRow) => {
  const data = await newRow.save();
  return data;
};
