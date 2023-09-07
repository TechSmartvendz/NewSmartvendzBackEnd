const mongoose = require("mongoose");
const { Schema } = mongoose;

const refillrequest = new Schema(
  {
    refillerId: {
      type: Schema.Types.ObjectId,
      ref: "user_info",
      require: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "warehouse",
      required: true,
      index: true
    },
    refillRequestNumber: { type: String, default: null, unique: true , index: true},
    machineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "machine",
      required: true,
      index: true
    },
    machineSlots: [
      {
        slot: { type: String, default: false },
        closingStock: { type: Number, default: 0 },
        currentStock: { type: Number, default: 0 },
        refillQuantity: { type: Number, default: 0 },
        saleQuantity: { type: Number, default: 0 },
        productid: { type: Schema.Types.ObjectId, ref: "product", index: true },
        sloteid: { type: String, default: false, index: true },
      },
    ],
    returnItems: [
      {
        slot: { type: String, default: false },
        closingStock: { type: Number, default: 0 },
        currentStock: { type: Number, default: 0 },
        refillQuantity: { type: Number, default: 0 },
        saleQuantity: { type: Number, default: 0 },
        productid: { type: Schema.Types.ObjectId, ref: "product", index: true },
        sloteid: { type: String, default: false, index: true },
      },
    ],
    date: { type: Date, default: null },
    sales:{
      cash: { type: Number, default: 0 },
      totalSalesCount: { type: Number, default: 0 },
      totalSalesValue: { type: Number, default: 0 },
    },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"] },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

refillrequest.set("toJSON");
refillrequest.set("toObject");

const Table = (module.exports = mongoose.model("refillrequest", refillrequest));

module.exports.generateSalesReport = async (startDate, endDate) => {
  try {
    const report = await Table.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $unwind: "$machineSlots", // Unwind the machineSlots array
      },
      {
        $group: {
          _id: {
            date: "$date",
            product: "$machineSlots.productid", // Use the productid from machineSlots
          },
          totalSaleQuantity: { $sum: "$machineSlots.saleQuantity" },
        },
      },
      {
        $lookup: {
          from: "products", // Replace with the actual collection name for products
          localField: "_id.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          productName: { $arrayElemAt: ["$productDetails.productname", 0] },
          totalSaleQuantity: 1,
        },
      },
      
      {
        $sort: { date: 1, productName: 1 },
      },
    ]);

    return report;
  } catch (error) {
    console.error("Error generating sales report:", error);
    return null;
  }
};