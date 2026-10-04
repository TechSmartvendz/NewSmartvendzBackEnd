const User = require("../model/m_user_info");
const jwt = require("jsonwebtoken");
const { asyncHandler } = require("./asyncHandler");
const rc = require("./../controllers/responseController");

function readToken(req) {
  const header = req.headers["authorization"];
  if (typeof header === "string") {
    const parts = header.trim().split(/\s+/);
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      return parts[1];
    }
  }
  if (req.cookies && typeof req.cookies.cookie === "string") {
    return req.cookies.cookie;
  }
  return null;
}

function isJwt(token) {
  return typeof token === "string" && token.split(".").length === 3;
}

const auth = asyncHandler(async (req, res, next) => {
  const token = readToken(req);
  if (!isJwt(token)) {
    return rc.setResponse(res, {
      error: "Session Not Found : Please Try After LogIn",
    });
  }

  let verifyUser;
  try {
    verifyUser = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return rc.setResponse(res, {
      error: "Invalid Session : Please Try After LogIn",
    });
  }

  const user = await User.findOne(
    { _id: verifyUser._id },
    { password: 0, otp: 0, __v: 0 }
  );
  req.user = user;
  req.tokenid = verifyUser;
  if (user == null) {
    return rc.setResponse(res, {
      error: "Invalid Session : Please Try After LogIn",
    });
  }
  next();
});

module.exports = auth;
