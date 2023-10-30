const mongoose = require("mongoose");
const { Schema } = mongoose;

const inv_User = new Schema(
  {
    userId: { type: String, require: true, unique: true },
    userName: { type: String, require: true, unique: true, trim: true },
    userNumber: { type: Number, default: null },
    userNumber1: { type: Number, default: null },
    userEmail: { type: String, require: true },
    userAddress: { type: String, require: true },
    country: { type: String, default: null },
    state: { type: String, default: null },
    city: { type: String, default: null },
    area: { type: String, default: null },
    role: { type: String, default: null },
    otp: { type: Number, default: 1234 },
    token: { type: String, default: null },
    password: { type: String, default: null },
    createdDate: { type: Date, default: Date.now() },
    dummy: {type: String, default: "User"},
    admin: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

inv_User.set("toJSON");
inv_User.set("toObject");

module.exports = mongoose.model("inv_User", inv_User);