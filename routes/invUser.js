var express = require("express");
var router = express.Router();
const {login, signup} = require("../controllers/inv_UserController")

router.post("/SignUp", signup);
router.post("/Login", login);

module.exports = router;
