const Jwt = require("jsonwebtoken");
const { lowerCase, size } = require("lodash");
const moment = require("moment");
const invUser = require("../model/inv_User");
const rc = require("./responseController");
const utils = require("../helper/apiHelper");
const commonHelper = require("../helper/common");
const { asyncHandler } = require("../middleware/asyncHandler");
const privateKey = process.env.SECRET_KEY;

const signup = asyncHandler(async (req, res) => {
  const pararms = req.body;
  // console.log(pararms);
  const checkEmailAlreadyExist = await utils.getData(invUser, {
    userEmail: lowerCase(pararms.userEmail),
    isDeleted: false,
  });
  console.log("checkEmailAlreadyExist: ", checkEmailAlreadyExist);
  const passwordHash = await commonHelper.generateNewPassword(pararms.password);
  if (size(checkEmailAlreadyExist))
    return rc.setResponse(res, {
      success: false,
      msg: "This Email is already registered with us.",
    });
  const obj = {
    userName: pararms.userName,
    userNumber: pararms.userNumber,
    userNumber1: pararms.userNumber1,
    userEmail: lowerCase(pararms.userEmail),
    userAddress: pararms.userAddress,
    country: pararms.country,
    state: pararms.state,
    city: pararms.city,
    area: pararms.area,
    role: pararms.role,
    password: passwordHash,
    createdDate: pararms.createdDate,
    // admin:
  };

  await utils.saveData(invUser, obj);
  return rc.setResponse(res, {
    success: true,
    data: "Signed Up Successfully",
  });
});

const login = asyncHandler(async (req, res) => {
  const pararms = req.body;

  const checkEmail = await invUser.find({
    userEmail: pararms.userEmail,
    isDeleted: false,
  });
  if (!size(checkEmail)) {
    return rc.setResponse(res, {
      success: false,
      data: "This Email or Phone is not registered with us.",
    });
  }
  const checkPasswordBoolean = await commonHelper.comparePassword(
    pararms.password,
    checkEmail[0].password
  );
  if (!checkPasswordBoolean)
    return rc.setResponse(res, {
      success: false,
      data: "Password is not valid.",
    });
  const tokenData = {
    email: checkEmail[0].email,
    _id: checkEmail[0]._id,
    date: moment().toDate(),
  };
  const token = Jwt.sign(tokenData, privateKey, { expiresIn: "1d" });
  const data = {
    token,
    name: `${checkEmail[0].userName}`,
  };
  return rc.setResponse(res, {
    success: true,
    data: data,
  });
  // return res.cookie("data", data).send("Login successfully");
});

module.exports = { signup, login };
