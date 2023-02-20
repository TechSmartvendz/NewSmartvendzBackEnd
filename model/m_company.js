const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const TableName = "company";

const TableSchema = mongoose.Schema({
    companyid: {
        type: String,
        require: true,
        unique: true
    },
    companyname: {
       type: String,
       require:true
       
    },
    address: {
     type: String,
     require:true
     
    },
    area: {
      type: String,
      require:true ////////////////////////editing 
   
    }, 
    telephone:{
      type: String,
    },
    alt_telepone:{
      type: String,
    },
    email:{
      type: String,
    },
    created_at: {
      type: Date,
      default: Date.now
    },
  created_by: {
      type: String,
      require:true,
      default:this.admin
  },
  last_update: {
      type: Date,
  },
  delete_status: {
      type:Boolean,
      require:true,
      default:false
  },
  admin: {
          type: String,
          required: true,
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
module.exports.getDataByQueryFilterDataOne = async (query) => {
  const data = await Table.findOne(
    query,
    { delete_status: 0,created_at:0,last_update:0, __v: 0 }
  );
  return data;
};

module.exports.getDataCountByQuery = async (query) => {
  const data = await Table.find(query).count();
  return data;
};
module.exports.getDataListByQuery = async () => {
  const data = await Table.find(
    {},
    { id: 1,companyid:1 }
  );
  return data;
};
module.exports.updateByQuery = async (query,newdata) => {
  newdata.last_update=Date.now()
  const data = await Table.findOneAndUpdate(query, { $set: newdata });
  return data;
};
module.exports.dataDeleteByQuery = async (query) => {
  const data = await Table.findOneAndRemove(query);
  return data;
};
module.exports.getDataforTable = async () => {
  const data= Table.aggregate([
    {
        "$project": {
            _id:1,
            role:1,
            companyid:1,
            companyname:1,
            // admin: {
            //   "$toObjectId": "$country"
            // },
          "admin": {
            "$toObjectId": "$admin"
          },
          created_at:1
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
        _id:1,
        role:1,
        companyid:1,
            companyname:1,
        "created by":"$output.user_id",
        "created at":{
          $dateToString: {
            format: "%Y-%m-%d %H:%M:%S",
            date: "$created_at",
            timezone: "Asia/Kolkata"
          }
        }

    }
    }
  ])

return data; 
};