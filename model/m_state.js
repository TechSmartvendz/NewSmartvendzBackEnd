const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const TableName = "state";

const TableSchema = mongoose.Schema({
    state: {
        type: String,
        require: true,
        unique: true
    },
    country: {
        type: String,
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
        type: Boolean,
        require: true,
        default: false
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
module.exports.getDataByIdFilterData = async (country, admin) => {
  const data = await Table.findOne(
    { country: country, admin: admin },
    { delete_status: 0,created_at:0,last_update:0, __v: 0 }
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
    { delete_status: 0, created_at:0, last_update:0,__v: 0 }
  );
  return data;
};
module.exports.getDataList = async (admin) => {
  const data = await Table.find(
    { admin: admin },
    { id: 1,state:1 }
  );
  return data;
};
module.exports.updateById = async (id,admin,newdata) => {
  const data = await Table.findOneAndUpdate({_id:id,admin:admin}, { $set: newdata });
  //const data = await Table.find({admin:admin},{delete_status:0,token:0,password:0,otp:0,__v:0});
  return data;
};
module.exports.dataDeleteById = async (state, admin) => {
  const data = await Table.findOneAndRemove({ state: state, admin: admin });
  return data;
};
////////////////////////////
//TODO:Use by State route
module.exports.getDataByFieldFilterData = async (state, admin) => {
    const data = await Table.find(
      { state: state, admin: admin },
      { delete_status: 0,created_at:0,last_update:0, __v: 0 }
    );
    return data;
  };