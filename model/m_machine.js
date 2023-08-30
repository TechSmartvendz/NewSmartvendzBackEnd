const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const TableName = "machine";

const TableSchema = mongoose.Schema({
  machineid: {
    type: String,
    require: true,
    unique: true,
  },
  machinename: {
    type: String,
    require: true,
    unique: true,
  },
  companyid: {
    type: String,
    require: true,
  },
  warehouse: {
    type: String,
    require: true,
  },
  refiller: {
    type: String,
    require: true,
  },
  building: {
    type: String,
    default: "N/A",
  },
  location: {
    type: String,
    default: "N/A",
  },
  producttype: {
    type: String,
    default: "N/A",
  },
  totalslots: {
    type: Number,
    default: 0,
    required: true,
  },
  remark: {
    type: String,
  },
  cash: {
    type: Number,
    default: 0,
  },
  totalSalesCount: {
    type: Number,
    default: 0,
  },
  totalSalesValue: {
    type: Number,
    default: 0,
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
});

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
module.exports.getDataByQueryFilterDataOneAggregate = async (machineid) => {
  const data = await Table.aggregate([
    // console.log("🚀 role:", machineid),
    {
      $match: { machineid: machineid },
    },
    {
      $project: {
        _id: 1,
        machineid: 1,
        machinename: 1,
        companyid: 1,
        warehouse: {
          $toObjectId: "$warehouse",
        },
        building: 1,
        location: 1,
        producttype: 1,
        totalslots: 1,
        admin: {
          $toObjectId: "$admin",
        },
        refillerName: 1,
        refiller: 1,
      },
    },
    {
      $lookup: {
        from: "warehouses",
        localField: "warehouse",
        foreignField: "_id",
        as: "warehouseoutput",
      },
    },
    { $unwind: "$warehouseoutput" },
    {
      $lookup: {
        from: "user_infos",
        localField: "refiller",
        foreignField: "user_id",
        as: "refillerOutput",
      },
    },
    { $unwind: "$refillerOutput" },
    {
      $lookup: {
        from: "user_infos",
        localField: "admin",
        foreignField: "_id",
        as: "adminOutput",
      },
    },
    { $unwind: "$adminOutput" },
    {
      $project: {
        _id: 1,
        machineid: 1,
        machinename: 1,
        companyid: 1,
        warehouse: "$warehouseoutput.wareHouseName",
        building: 1,
        location: 1,
        producttype: 1,
        totalslots: 1,
        admin: "$adminOutput.first_name",
        refillerName: "$refillerOutput.first_name",
        refiller: 1,
      },
    },
  ]);
  return data;
};
module.exports.getDataCountByQuery = async (query) => {
  const data = await Table.find(query).count();
  return data;
};
module.exports.getDataListByQuery = async () => {
  const data = await Table.find({}, { id: 1, machineid: 1, machinename: 1 });
  return data;
};
module.exports.updateByQuery = async (query, newdata) => {
  newdata.last_update = Date.now();
  const data = await Table.findOneAndUpdate(query, { $set: newdata });
  return data;
};
module.exports.dataDeleteByQuery = async (query) => {
  const data = await Table.findOneAndRemove(query);
  return data;
};
module.exports.getDataforTable = async () => {
  const data = Table.aggregate([
    {
      $project: {
        _id: 1,
        machineid: 1,
        companyid: 1,
        companyName: 1,
        machinename: 1,
        // location: 1,
        totalslots: 1,
        warehouse: {
          $toObjectId: "$warehouse",
        },
        admin: {
          $toObjectId: "$admin",
        },
        refiller: 1,
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
        from: "user_infos",
        localField: "refiller",
        foreignField: "user_id",
        as: "outputRefiller",
      },
    },
    { $unwind: "$outputRefiller" },
    {
      $lookup: {
        from: "warehouses",
        localField: "warehouse",
        foreignField: "_id",
        as: "warehouseoutput",
      },
    },
    { $unwind: "$warehouseoutput" },
    {
      $lookup: {
        from: "companies",
        localField: "companyid",
        foreignField: "companyid",
        as: "outputCompany",
      },
    },
    { $unwind: "$outputCompany" },
    {
      $project: {
        _id: 1,
        machine_id: "$machineid",
        // total_slots: "$totalslots",
        machine_name: "$machinename",
        // company_id: "$companyid",
        // companyName: "$outputCompany.companyname",
        // location: "$location",
        warehouse: "$warehouseoutput.wareHouseName",
        created_by: "$output.first_name",
        refiller: "$outputRefiller.first_name",
        created_at: {
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
