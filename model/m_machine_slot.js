const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const TableName = "machine_slot";

const TableSchema = mongoose.Schema({
  machineid: {
    type: String,
    require: true,
  },
  machineName: {
    type: String,
    require: true,
  },
  slot: {
    type: String,
    require: true,
  },
  product: {
    type: String,
    require: true,
    default: null,
  },
  maxquantity: {
    type: Number,
    require: true,
  },
  sloteid: {
    type: String,
    require: true,
    default: generateslotId,
    unique: true,
  },
  active_status: {
    type: Boolean,
    default: false,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  created_by: {
    type: String,
    require: true,
    default: this.admin,
  },
  last_update: {
    type: Date,
  },
  delete_status: {
    type: Boolean,
    require: true,
    default: false,
  },
  admin: {
    type: String,
    required: true,
  },
  closingStock: {
    type: Number,
    max: maxquantity,
  },
  currentStock: { type: Number, default: 0, minimum: 0 },
  refillQuantity: { type: Number, default: 0 },
  saleQuantity: { type: Number, default: 0 },
});

function maxquantity() {
  return this.maxquantity; // Set the max value to the value of maxQuantity
}

function generateslotId() {
  return this.slot + this.machineid;
}
const Table = (module.exports = mongoose.model(TableName, TableSchema));
// //const OldTable = mongoose.model("old" + TableName, TableSchema);

module.exports.addRow = async (newRow) => {
  const data = await newRow.save();
  return data;
};
module.exports.getDataByIdData = async (id) => {
  const data = await Table.findOne(
    { _id: id },
    { delete_status: 0, last_update: 0, __v: 0 }
  );
  return data;
};
module.exports.getDataByQueryFilterData = async (query) => {
  const data = await Table.find(query, {
    delete_status: 0,
    created_at: 0,
    last_update: 0,
    __v: 0,
  });
  return data;
};
module.exports.getDataByQueryFilterDataOne = async (query) => {
  const data = await Table.findOne(query, {
    delete_status: 0,
    created_at: 0,
    last_update: 0,
    __v: 0,
  });
  return data;
};
module.exports.getDataCountByQuery = async (query) => {
  const data = await Table.find(query).count();
  return data;
};
module.exports.getDataListByQuery = async () => {
  const data = await Table.find({}, { id: 1, companyid: 1 });
  return data;
};
module.exports.updateByQuery = async (query, newdata) => {
  newdata.last_update = Date.now();
  let sloteid = newdata.slot + newdata.machineid;
  const cdata = await Table.findOne({ sloteid: sloteid });
  if (!cdata) {
    newdata.sloteid = sloteid;
    const data = await Table.findOneAndUpdate(query, { $set: newdata });
    return data;
  } else {
    if (cdata._id == newdata._id) {
      newdata.sloteid = sloteid;
      const data = await Table.findOneAndUpdate(query, { $set: newdata });
      return data;
    }
    throw "Slot already created..";
  }
};
module.exports.dataDeleteByQuery = async (query) => {
  const data = await Table.findOneAndRemove(query);
  return data;
};
module.exports.getDataforTable = async (machineid) => {
  //console.log("🚀 ~ file: m_machine_slot.js:104 ~ module.exports.getDataforTable= ~ machineid", machineid)

  const data = Table.aggregate([
    {
      $match: { machineid: machineid },
    },
    {
      $project: {
        _id: 1,
        machineid: {
          $toObjectId: "$machineid",
        },
        slot: 1,
        product: {
          $toObjectId: "$product",
        },
        maxquantity: 1,
        admin: {
          $toObjectId: "$created_by",
        },
        created_at: 1,
      },
    },
    {
      $lookup: {
        from: "user_infos",
        localField: "admin",
        foreignField: "_id",
        as: "output",
      },
    },
    { $unwind: "$output" },
    {
      $lookup: {
        from: "machines",
        localField: "machineid",
        foreignField: "_id",
        as: "output2",
      },
    },
    { $unwind: "$output2" },
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "productresult",
      },
    },
    { $unwind: "$productresult" },
    {
      $project: {
        _id: 1,
        role: 1,
        "machine id": "$output2.machineid",
        slot: 1,
        "max quantity": "$maxquantity",
        "created by": "$output.display_name",
        product: "$productresult.productname",
        "created at": {
          $dateToString: {
            format: "%Y-%m-%d %H:%M:%S",
            date: "$created_at",
            timezone: "Asia/Kolkata",
          },
        },
      },
    },
  ]);
  return data;
};

module.exports.getDataForEditFormAssignUser = async (id) => {
  //console.log("🚀 ~ file: m_company_admin.js:164 ~ module.exports.getDataForEditFormAssignUser= ~ id", id)
  id = mongoose.Types.ObjectId(id);
  const data = Table.aggregate([
    {
      $match: { _id: id },
    },
    {
      $project: {
        _id: 1,
        machineid: {
          $toObjectId: "$machineid",
        },
        product: {
          $toObjectId: "$product",
        },
        slot: 1,
        maxquantity: 1,
        active_status: 1,
      },
    },
    // {
    //   "$lookup": {
    //     "from": "user_infos",
    //     "localField": "admin",
    //     "foreignField": "_id",
    //     "as": "output"
    //   }
    // },
    // { $unwind: "$output" },
    {
      $lookup: {
        from: "machines",
        localField: "machineid",
        foreignField: "_id",
        as: "output2",
      },
    },
    { $unwind: "$output2" },
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "productresult",
      },
    },
    { $unwind: "$productresult" },
    {
      $project: {
        _id: 1,
        role: 1,
        machineid: "$output2.machineid",
        slot: 1,
        product: "$productresult.productname",
        maxquantity: 1,
        active_status: 1,
      },
    },
  ]);
  return data;
};

module.exports.getDataforTablePagination = async (
  machinedata,
  page,
  dataperpage
) => {
  const skipdata = page * dataperpage - dataperpage;
  const dp = parseInt(dataperpage);
  let end = skipdata + parseInt(dataperpage);
  console.log(skipdata);
  console.log(dp);
  console.log(end);
  const data = await Table.aggregate([
    {
      $match: { machineName: machinedata },
    },
    { $sort: { created_at: -1 } },
    {
      $facet: {
        metadata: [
          { $count: "count" },
          {
            $addFields: { start: skipdata + 1, end: end, page: parseInt(page) },
          },
        ],
        data: [
          { $skip: skipdata },
          { $limit: dp },
          {
            $project: {
              _id: 1,
              slot: 1,
              machineid: {
                $toObjectId: "$machineid",
              },
              maxquantity: 1,
              created_by: {
                $toObjectId: "$created_by",
              },
              product: {
                $toObjectId: "$product",
              },
              created_at: 1,
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "product",
              foreignField: "_id",
              as: "output",
            },
          },
          { $unwind: "$output" },
          {
            $lookup: {
              from: "machines",
              localField: "machineid",
              foreignField: "_id",
              as: "machineoutput",
            },
          },
          { $unwind: "$machineoutput" },
          {
            $lookup: {
              from: "user_infos",
              localField: "created_by",
              foreignField: "_id",
              as: "userinfooutput",
            },
          },
          { $unwind: "$userinfooutput" },
          {
            $project: {
              _id: 1,
              slot: 1,
              machineid: "$machineoutput.machineid",
              maxquantity: 1,
              created_by: "$userinfooutput.first_name",
              product: "$output.productname",
              "created at": {
                $dateToString: {
                  format: "%Y-%m-%d %H:%M:%S",
                  date: "$created_at",
                  timezone: "Asia/Kolkata",
                },
              },
            },
          },
        ],
      },
    },
  ]);
  const jsonData = {
    metadata: data[0].metadata[0],
    data: data[0].data,
  };

  return jsonData;
};
