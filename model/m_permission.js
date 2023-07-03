const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const TableName = "permission";

const TableSchema = mongoose.Schema({
  role: {
    type: String,
    require: true,
    unique: true,
  },
  usermanage: {
    type: Boolean,
    default: false,
  },
  addnewuser: {
    type: Boolean,
    default: false,
  },
  listuser: {
    type: Boolean,
    default: false,
  },
  userpermission: {
    type: Boolean,
    default: false,
  },
  userrole: {
    type: Boolean,
    default: false,
  },
  companymanage: {
    type: Boolean,
    default: false,
  },
  addnewcompany: {
    type: Boolean,
    default: false,
  },
  listcompany: {
    type: Boolean,
    default: false,
  },
  companyadmins: {
    type: Boolean,
    default: false,
  },
  companymachines: {
    type: Boolean,
    default: false,
  },
  managemachine: {
    type: Boolean,
    default: false,
  },
  addnewmachine: {
    type: Boolean,
    default: false,
  },
  listmachine: {
    type: Boolean,
    default: false,
  },
  machineconfiguration: {
    type: Boolean,
    default: false,
  },
  employeemanage: {
    type: Boolean,
    default: false,
  },
  addnewemployee: {
    type: Boolean,
    default: false,
  },
  updateemployee: {
    type: Boolean,
    default: false,
  },
  searchandupdateemployee: {
    type: Boolean,
    default: false,
  },
  countrymanage: {
    type: Boolean,
    default: false,
  },
  statemanage: {
    type: Boolean,
    default: false,
  },
  citymanage: {
    type: Boolean,
    default: false,
  },
  areamanage: {
    type: Boolean,
    default: false,
  },
  unitmanage: {
    type: Boolean,
    default: false,
  },
  refillermanager: {
    type: Boolean,
    default: false,
  },
  managedc: {
    type: Boolean,
    default: false,
  },
  managedcaccept: {
    type: Boolean,
    default: false,
  },
  managecompletedrefillrequest: {
    type: Boolean,
    default: false,
  },
  products: {
    type: Boolean,
    default: false,
  },
  productlist: {
    type: Boolean,
    default: false,
  },
  bulkproductupload: {
    type: Boolean,
    default: false,
  },
  singleproductadd: {
    type: Boolean,
    default: false,
  },
  updatebulkproduct: {
    type: Boolean,
    default: false,
  },
  refillermanage: {
    type: Boolean,
    default: false,
  },
  refillerrequest: {
    type: Boolean,
    default: false,
  },
  refillerdc: {
    type: Boolean,
    default: false,
  },
  refillerdcaccept: {
    type: Boolean,
    default: false,
  },
  transactions: {
    type: Boolean,
    default: false,
  },
  addWareHouse: {
    type: Boolean,
    default: false,
  },
  listWarehouse: {
    type: Boolean,
    default: false,
  },
  addStock: {
    type: Boolean,
    default: false,
  },
  listStock: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  created_by: {
    type: String,
  },
  last_update: {
    type: Date,
  },
  admin: {
    type: String,
    required: true,
    default: "null",
  },
  delete_status: {
    type: Boolean,
    require: true,
    default: false,
  },
});

const Table = (module.exports = mongoose.model(TableName, TableSchema));
////const OldTable = mongoose.model("old" + TableName, TableSchema);

//TODO:
module.exports.addRow = async (newRow) => {
  const data = await newRow.save();
  return data;
};
//TODO:
module.exports.getDataByIdData = async (id) => {
  const data = await Table.findOne(
    { _id: id },
    { delete_status: 0, last_update: 0, __v: 0 }
  );
  return data;
};
//TODO:
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
  const data = await Table.find({}, { id: 1, state: 1 });
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
        role: 1,

        // admin: {
        //   "$toObjectId": "$country"
        // },
        admin: {
          $toObjectId: "$admin",
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
    // {
    //   "$lookup": {
    //     "from": "countries",
    //     "localField": "country",
    //     "foreignField": "_id",
    //     "as": "output2"
    //   }
    // },
    // { $unwind: "$output2" },
    {
      $project: {
        _id: 1,
        role: 1,
        "created by": "$output.user_id",
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
