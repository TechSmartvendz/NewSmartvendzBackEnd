const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const TableName = "country";

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
//TODO:THIS IS USING at /SuperAdminRegistration
module.exports.addRow = async (newRow) => {
  const data = await newRow.save();
  return data;
};
//TODO:THIS IS USING at Not using right now
module.exports.getDataByIdFullData = async (id, admin) => {
  const data = await Table.findOne({ _id: id, admin: admin });
  return data;
};
//TODO:THIS IS USING at GET /User/:id
module.exports.getDataByIdFilterData = async (id, admin) => {
  const data = await Table.findOne(
    { _id: id, admin: admin },
    { delete_status: 0, token: 0, password: 0, otp: 0, __v: 0 }
  );
  return data;
};
module.exports.getDataCount = async (admin) => {
  const data = await Table.findOne({ admin: admin }).count();
  return data;
};
module.exports.getAllData = async (admin) => {
  const data = await Table.find(
    { admin: admin },
    { delete_status: 0, token: 0, password: 0, otp: 0, __v: 0 }
  );
  return data;
};
module.exports.getDataList = async (admin) => {
  const data = await Table.find(
    { admin: admin },
    { id: 1, user_id: 1, user_last_name: 1, user_first_name: 1 }
  );
  return data;
};
module.exports.updateById = async (id, newdata, admin) => {
  const data = await Table.findByIdAndUpdate(id, { $set: newdata });
  //const data = await Table.find({admin:admin},{delete_status:0,token:0,password:0,otp:0,__v:0});
  return data;
};
module.exports.dataDeleteById = async (id, admin) => {
  const data = await Table.findOneAndRemove({ _id: id, admin: admin });
  return data;
};

