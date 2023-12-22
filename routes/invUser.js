var express = require("express");
var router = express.Router();
const {login, signup, forgotPasswordOtp, verifyOtp, changePassword} = require("../controllers/inv_UserController")

router.post("/SignUp", signup);
router.post("/Login", login);

router.post("/forgotPasswordOtp", forgotPasswordOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/changePassword", changePassword);

module.exports = router;
