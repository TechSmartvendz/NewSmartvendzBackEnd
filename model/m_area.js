const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const TableName = "area";

const TableSchema = mongoose.Schema({
    area:{
        type:String,
        require: true,
        unique:true
    },
    city:{
        type:String,
        require: true,
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
  }, delete_status: {
    type:Boolean,
    require:true,
    default:false
}
});

const Table = (module.exports = mongoose.model(TableName, TableSchema));
const OldTable = mongoose.model("old" + TableName, TableSchema);
//TODO:
module.exports.addRow = async (newRow) => {
  const data = await newRow.save();
  return data;
};
//TODO:
module.exports.getDataByIdData = async (id) => {
  const data = await Table.findOne({ _id: id},{ delete_status: 0,last_update:0, __v: 0 });
  return data;
};
//TODO:
module.exports.getDataByQueryFilterData = async (query) => {
  const data = await Table.find(
    query,
    { delete_status: 0,created_at:0,last_update:0, __v: 0 }
  );
  return data;
};
//TODO:
module.exports.getDataByQueryFilterDataOne = async (query) => {
  const data = await Table.findOne(
    query,
    { delete_status: 0,created_at:0,last_update:0, __v: 0 }
  );
  return data;
};
//TODO:
module.exports.getDataCountByQuery = async (query) => {
  const data = await Table.find(query).count();
  return data;
};
//TODO:
module.exports.getDataListByQuery = async () => {
  const data = await Table.find(
    {},
    { id: 1,area:1 }
  );
  return data;
};
//TODO:
module.exports.updateByQuery = async (query,newdata) => {
  const data = await Table.findOneAndUpdate(query, { $set: newdata });
  return data;
};
//TODO:
module.exports.dataDeleteByQuery = async (query) => {
  const data = await Table.findOneAndRemove(query);
  return data;
};
//TODO:
module.exports.getDataforTable = async () => {
  const data= Table.aggregate([
    {
        "$project": {
            _id:1,
            area:1,
            city: {
              "$toObjectId": "$city"
            },
          "admin": {
            "$toObjectId": "$admin"
          }
        }
      },
      {
        "$lookup": {
          "from": "user_infos",
          "localField": "admin",
          "foreignField": "_id",
          "as": "output"
        }
      },
      { $unwind: "$output" },
      {
        "$lookup": {
          "from": "cities",
          "localField": "city",
          "foreignField": "_id",
          "as": "output2"
        }
      },
      { $unwind: "$output2" },
    {
      $project: {
        _id:1,
        area:1,
        city:"$output2.city",
        admin:"$output.user_id"
    }
    }
  ])

return data; 
};