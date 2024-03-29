var express = require("express");
var router = express.Router();
// const bcrypt = require("bcryptjs");
// const TableModel = require("../model/m_user_info");
// const rc = require("./../controllers/responseController");
// const { asyncHandler } = require("../middleware/asyncHandler");
const validator = require('express-joi-validation').createValidator();
// const loginController = require("../controllers/loginController")
const {login, check} = require("../controllers/loginController")
const {userLogin} = require("../validation/user");

/* GET home page. */
// router.get("/", function (req, res, next) {
//   res.status(200).json({ path: "/", status: "success" });
// });

// router.post(
//   "/api/Login", validator.body(userLogin),
//   asyncHandler(async (req, res) => {
//     const user_id = req.body.user_id;
//     const password = req.body.password;
//     const sendData = await TableModel.getLoginData(user_id);
//     // console.log(sendData);
//     if (sendData) {
//       const passwordmatch = await bcrypt.compare(password, sendData.password);
//       const data = {
//         username: sendData.first_name,
//         role: sendData.role,
//         token: sendData.token
//       };
//       if (passwordmatch) {
//         return rc.setResponse(res, {
//           success: true,
//           msg: "Data Fetched",
//           data: data,
//         });
//       } else {
//         return rc.setResponse(res, {
//           msg: "Invalid Password",
//         });
//       }
//     } else {
//       return rc.setResponse(res, {
//         msg: "User not Found",
//         data: { user_id: user_id },
//       });
//     }
//   })
// );

// module.exports = router;

router.get("/", check);
router.post("/api/Login", validator.body(userLogin), login);

module.exports = router;
