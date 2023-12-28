const Jwt = require("jsonwebtoken");
const { lowerCase, size, toLower } = require("lodash");
const moment = require("moment");
const invUser = require("../model/inv_User");
const rc = require("./responseController");
const utils = require("../helper/apiHelper");
const commonHelper = require("../helper/common");
const { asyncHandler } = require("../middleware/asyncHandler");
const privateKey = process.env.SECRET_KEY;
const Mailer = require("../helper/mailer");

const signup = asyncHandler(async (req, res) => {
  const pararms = req.body;
  // console.log(pararms);
  const checkEmailAlreadyExist = await utils.getData(invUser, {
    userEmail: pararms.userEmail,
    isDeleted: false,
  });
  // console.log("checkEmailAlreadyExist: ", checkEmailAlreadyExist);
  // console.log(size(checkEmailAlreadyExist))
  if (size(checkEmailAlreadyExist))
    return rc.setResponse(res, {
      success: false,
      msg: "This Email is already registered with us.",
    });
  const passwordHash = await commonHelper.generateNewPassword(pararms.password);
  const obj = {
    userName: pararms.userName,
    userNumber: pararms.userNumber,
    userNumber1: pararms.userNumber1,
    userEmail: pararms.userEmail,
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
  // console.log("pararms: ", pararms);
  const checkEmail = await invUser.find({
    userEmail: pararms.userEmail,
    isDeleted: false,
  });
  // console.log("checkEmail: ", checkEmail);
  if (!size(checkEmail)) {
    return rc.setResponse(res, {
      success: false,
      data: "This Email or Phone is not registered with us.",
    });
  }
  const checkPasswordBoolean = await commonHelper.comparePassword(
    lowerCase(pararms.password),
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
    role: checkEmail[0].role,
  };
  const token = Jwt.sign(tokenData, privateKey, { expiresIn: "1h" });
  const updateResult = await utils.updateData(
    invUser,
    { _id: checkEmail[0]._id },
    { token: token }
  );
  // console.log('updateResult: ', updateResult);
  if (!updateResult.success) {
    return rc.setResponse(res, {
      success: false,
      data: "Failed to update token in the database.",
    });
  }
  const data = {
    token,
    name: `${checkEmail[0].userName}`,
    role: checkEmail[0].role,
  };
  res.cookie("invToken", JSON.stringify(data), {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
  return rc.setResponse(res, {
    success: true,
    data: data,
  });
  // return res.cookie("data", data).send("Login successfully");
});

const forgotPasswordOtp = asyncHandler(async (req, res) => {
  const pararms = req.body;
  const checkEmail = await utils.getData(invUser, {
    userEmail: toLower(pararms.email),
    isDeleted: false,
  });
  if (!size(checkEmail)) {
    return rc.setResponse(res, {
      success: false,
      msg: "This Email or Phone is not registered with us.",
    });
  }
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  pararms.otp = randomNum;
  const html = "Hi User your verification code is :'" + pararms.otp + "'";
  const data = await utils.updateData(
    invUser,
    {
      userEmail: toLower(pararms.email),
    },
    pararms
  );
  Mailer.sendMail(
    { to: pararms.email, subject: " Forgot  OTP", html: html },
    (err, mailData) => {
      console.log(err, mailData);
    }
  );
  return rc.setResponse(res, {
    success: true,
    msg: "Otp send to your mail",
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const pararms = req.body;
  const filter = { userEmail: req.query.email, isDeleted: false };
  const projection = { otp: 1 };
  const options = {};
  const checkOtp = await utils.getData(invUser, filter, projection, options);
  if (checkOtp[0].otp == pararms.otp) {
    return rc.setResponse(res, {
      success: true,
      msg: "Otp verified",
    });
  }
  return rc.setResponse(res, {
    success: false,
    msg: "Otp is wrong!",
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const pararms = req.body;
  const passwordHash = await commonHelper.generateNewPassword(pararms.password);

  const obj = {
    password: passwordHash,
  };
  const data = await utils.updateData(invUser, { userEmail: req.query.email }, obj);
  return rc.setResponse(res, {
    success: true,
    msg: "Password changed successfully",
  });
});

module.exports = {
  signup,
  login,
  forgotPasswordOtp,
  verifyOtp,
  changePassword,
};
