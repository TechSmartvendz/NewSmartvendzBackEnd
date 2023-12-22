const jwt = require("jsonwebtoken");
const { asyncHandler } = require("./asyncHandler");
const rc = require("./../controllers/responseController");

const privateKey = process.env.SECRET_KEY;

module.exports = asyncHandler(async (req, res, next) => {
  const cookieINV = req.cookies;
  // console.log("cookieINV: ", cookieINV);
  try {
    if (req.headers["authorization"]) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, privateKey);
      req.userData = decoded;
      next();
    }
    else if (cookieINV && cookieINV.invToken) {
      const token = cookieINV.invToken;
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.userData = decoded;
      next();
    }
    else {
      return rc.setResponse(res, {
        error: "Session Not Found : Please Try After LogIn",
      });
    }
  } catch (error) {
    return rc.setResponse(res, {
      success: false,
      msg: "Unauthorized",
    });
  }
});
