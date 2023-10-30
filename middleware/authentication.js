const jwt = require("jsonwebtoken");
const { asyncHandler } = require("./asyncHandler");
const rc = require("./../controllers/responseController");

const privateKey = process.env.SECRET_KEY;

module.exports = asyncHandler((req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, privateKey);
    req.userData = decoded;
    next();
  } catch (error) {
    return rc.setResponse(res, {
      success: false,
      msg: "Unauthorized",
    });
  }
});
