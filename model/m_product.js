const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const e = require("express");

const TableName = "product";

const TableSchema = mongoose.Schema({
  productid: {
    type: String,
    require: true,
    unique: true,
  },
  productname: {
    type: String,
    require: true,
    unique: true,
  },
  description: {
    type: String,
  },
  materialtype: {
    type: String,
    require: true,
  },
  sellingprice: {
    type: Number,
    default:0,
  },
  mass: {
    type: String,
    default: "N/A",
  },
  unit: {
    type: String,
    default: "N/A",
  },
  remark: {
    type: String,
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
        machinename: 1,
        location: 1,
        totalslots: 1,
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
        "machine id": "$machineid",
        "total slots": "$totalslots",
        "machine name": "$machinename",
        "company id": "$companyid",
        location: "$location",
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

module.exports.getDataforTablePaginationWithQuery = async (page, dataperpage,query) => {
  console.log("🚀 ~ file: m_product.js:172 ~ module.exports.getDataforTablePaginationWithQuery= ~ query:", query)
  const skipdata = page * dataperpage - dataperpage;
  const dp = parseInt(dataperpage);
  let end = skipdata + parseInt(dataperpage);
  var myMatch = {
  };
  const data = await Table.aggregate([
    {
      $match: query
    
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
              productid: 1,
              productname: 1,
              materialtype: 1,
              sellingprice: 1,
              mass: 1,
              unit: 1,
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
          {
            $project: {
              _id: 1,
              "product id": "$productid",
              "product name": "$productname",
              "material type": "$materialtype",
              price: "$sellingprice",
              unit: "$mass" + "$unit",
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
        ],
      },
    },
  ]);
  const jsonData = {
    metadata: data[0].metadata[0],
    data: data[0].data,
  };
  if(jsonData.metadata){
    return jsonData;
  }else{
    throw "Data Not found"
  }
 
 
};
  


module.exports.getDataforTablePagination = async (page, dataperpage) => {
  const skipdata = page * dataperpage - dataperpage;
  const dp = parseInt(dataperpage);
  let end = skipdata + parseInt(dataperpage);
  const data = await Table.aggregate([
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
              productid: 1,
              productname: 1,
              materialtype: 1,
              sellingprice: 1,
              mass: 1,
              unit: 1,
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
          {
            $project: {
              _id: 1,
              "product id": "$productid",
              "product name": "$productname",
              "material type": "$materialtype",
              price: "$sellingprice",
              unit: "$mass" + "$unit",
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
