const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const TableName = "companyAdmin";

const TableSchema = mongoose.Schema({

   
    companyid: {
        type: String,
        require: true,
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
   assign_user: {
          type: String,
          required: true,
  },
  assignid:{
    type: String,
    require: true,
    default:generateAsssirnId,
    unique:true
  },
  active_status: {
    type: Boolean,
    default:false,
    required: true,
},
  
});

//TODO: Internal user functions
function generateAsssirnId(){
 
  return this.companyid+this.assign_user
} 

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
  let assignid=newdata.companyid+newdata.assign_user
  const cdata= await Table.findOne({assignid:assignid}).count()
   if(!cdata){
    newdata.assignid=assignid
    const data = await Table.findOneAndUpdate(query, { $set: newdata });
    return data;
   }else{
    throw "User already assign"
   }
   
  
  
};
module.exports.dataDeleteByQuery = async (query) => {
  const data = await Table.findOneAndRemove(query);
  return data;
};
module.exports.getDataforTable = async (companyid) => {
  const data= Table.aggregate([
    {

      $match : { companyid : companyid } },
      {

        "$project": {
            _id:1,
            companyid:1,
            companyname:1,
            assign_user: {
              "$toObjectId": "$assign_user"
            },
          "admin": {
            "$toObjectId": "$created_by"
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
      {
        "$lookup": {
          "from": "user_infos",
          "localField": "assign_user",
          "foreignField": "_id",
          "as": "output2"
        }
      },
      { $unwind: "$output2" },
    {
      $project: {
        _id:1,
        role:1,
        "company id":"$companyid",
        "user type":"$output2.role",
        "assign user":"$output2.user_id",
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

module.exports.getDataForEditFormAssignUser = async (id) => {
  console.log("🚀 ~ file: m_company_admin.js:164 ~ module.exports.getDataForEditFormAssignUser= ~ id", id)
  id = mongoose.Types.ObjectId(id)
  const data= Table.aggregate([
    
    {
       "$match": { "_id":id }
       
    },
      {

        "$project": {
            _id:1,
            companyid:1,
            companyname:1,
            active_status:1,
            assign_user: {
              "$toObjectId": "$assign_user"
            },
          "admin": {
            "$toObjectId": "$created_by"
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
      {
        "$lookup": {
          "from": "user_infos",
          "localField": "assign_user",
          "foreignField": "_id",
          "as": "output2"
        }
      },
      { $unwind: "$output2" },
    {
      $project: {
        _id:1,
        role:1,
        "companyid":"$companyid",
        "role":"$output2.role",
        "assign_user":"$output2.user_id",
        active_status:1,

    }
    }
  ])
return data; 
};