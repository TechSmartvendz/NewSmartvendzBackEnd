const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const e = require("express");

const TableName = "logic";

const TableSchema = mongoose.Schema({

  logicid:{
    type: String,
    require: true,
    unique:true 
  },
  logicid:{
    type: String,
    require: true,
    unique:true 
  },
  logictype:{
    type: String,
    require: true,
  },
  companyid:{
    type: String,
    require:true
  },
  machineid:{
    type: String,
    require:true
  },
  creditenable:{
   type:Boolean,
   require:true, 
   default:false,

  },
  credittype:{
    type:String,
    require:true, 
    default:"N/A",
   },
   creditamount:{
    type:Number,
    require:true, 
    default:0,
   },
   creditautorenew:{
    type:Boolean,
    require:true, 
    default:false,
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

function generateLogicId(){

  return this.companyid+this.machineid
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
  const data = await Table.find({}, { id: 1, productname:1,productid:1});
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
  // console.log("🚀 ~ file: m_product.js:172 ~ module.exports.getDataforTablePaginationWithQuery= ~ query:", query)
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
            logicid: 1,
            logictype: 1,
            creditenable: 1,
            credittype: 1,
            creditamount: 1,
            creditautorenew: 1,
            admin: {
              $toObjectId: "$admin",
            },
            companyid: {
              $toObjectId: "$companyid",
            },
            machineid: {
              $toObjectId: "$machineid",
            }
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
            from: "companies",
            localField: "companyid",
            foreignField: "_id",
            as: "output2",
          },
        },
        { $unwind: "$output2" },
        {
          $lookup: {
            from: "machines",
            localField: "machineid",
            foreignField: "_id",
            as: "output3",
          },
        },
        { $unwind: "$output3" },
        {
          $project: {
            _id: 1,
            "logic id": "$logicid",
            "company id": "$output2.companyid",
            "machine id": "$output3.machineid",
            logictype: "$logictype",
            "credit enable": "$creditenable",
            "credit type": "$credittype",
            "credit amount": "$creditamount",
            "credit autorenew": "$creditautorenew",
            "created by": "$output.user_id",
            // "created at": {
            //   $dateToString: {
            //     format: "%Y-%m-%d %H:%M:%S",
            //     date: "$created_at",
            //     timezone: "Asia/Kolkata",
            //   },
            // },
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
module.exports.getDataforCSVWithQuery = async (query) => {
  const data = await Table.find(query, { _id: 0,admin:0,delete_status:0,last_update:0,created_at:0,created_by:0,__v:0});
  return data;
 
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
              logicid: 1,
              logictype: 1,
              creditenable: 1,
              credittype: 1,
              creditamount: 1,
              creditautorenew: 1,
              admin: {
                $toObjectId: "$admin",
              },
              companyid: {
                $toObjectId: "$companyid",
              },
              machineid: {
                $toObjectId: "$machineid",
              }
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
              from: "companies",
              localField: "companyid",
              foreignField: "_id",
              as: "output2",
            },
          },
          { $unwind: "$output2" },
          {
            $lookup: {
              from: "machines",
              localField: "machineid",
              foreignField: "_id",
              as: "output3",
            },
          },
          { $unwind: "$output3" },
          {
            $project: {
              _id: 1,
              "logic id": "$logicid",
              "company id": "$output2.companyid",
              "machine id": "$output3.machineid",
              logictype: "$logictype",
              "credit enable": "$creditenable",
              "credit type": "$credittype",
              "credit amount": "$creditamount",
              "credit autorenew": "$creditautorenew",
              "created by": "$output.user_id",
              // "created at": {
              //   $dateToString: {
              //     format: "%Y-%m-%d %H:%M:%S",
              //     date: "$created_at",
              //     timezone: "Asia/Kolkata",
              //   },
              // },
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

