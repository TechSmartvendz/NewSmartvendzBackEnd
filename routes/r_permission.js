const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const TableModelUser = require("../model/m_user_info");
const TableModel = require("../model/m_permission");
// const TableModelCity = require('../model/m_city');
const rc = require("../controllers/responseController");
const { asyncHandler } = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");

router.post(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    console.log("user",req.user)
    if (req.user.role === "SuperAdmin") {

      //    const query={
      //     country:req.body.country
      //    }
      //     var cdata = await TableModelCountry.getDataByQueryFilterDataOne(query);
      if (req.body.role) {
        newRow = new TableModel(req.body);
        newRow.admin = req.user._id;
        // newRow.country=cdata.id
        if (!newRow) {
          return rc.setResponse(res, {
            msg: "No Data to insert",
          });
        }
        const data = await TableModel.addRow(newRow);
        if (data) {
          return rc.setResponse(res, {
            success: true,
            msg: "Data Inserted",
            data: data,
          });
        }
      } else {
        // console.log("fcscascasc");
        return rc.setResponse(res, { error: "Please fill Data properly" });
      }
    } else {
    //   console.log(error);
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);
router.get(
  "/",
  auth,
  asyncHandler(async (req, res, next) => {
    const admin = req.user.id;
    const data = await TableModel.getDataforTable(admin);
    if (data) {
      return rc.setResponse(res, {
        success: true,
        msg: "Data Fetched",
        data: data,
      });
    } else {
      return rc.setResponse(res, {
        msg: "Data not Found",
      });
    }
  })
);
router.get(
  "/Datalist",
  auth,
  asyncHandler(
    //getDataListByQuery
    async (req, res, next) => {
      const admin = req.user.id;
      const data = await TableModel.getDataforTable(admin);
      if (data) {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: data,
        });
      } else {
        return rc.setResponse(res, {
          msg: "Data not Found",
        });
      }
    }
  )
);
router.get(
  "/LoadMenu",
  auth,
  asyncHandler(async (req, res, next) => {
    const role = req.user.role;
    const query = {
      role: role,
    };
    const data = await TableModel.getDataByQueryFilterDataOne(query);
    if (data) {
      return rc.setResponse(res, {
        success: true,
        msg: "Data Fetched",
        data: data,
      });
    } else {
      return rc.setResponse(res, {
        msg: "Data not Found",
      });
    }
  })
);
router.get(
  "/:id",
  auth,
  asyncHandler(async (req, res, next) => {
    const role = req.params.id;
    const query = {
      _id: role,
    };
    const data = await TableModel.getDataByQueryFilterDataOne(query);
    if (data) {
      return rc.setResponse(res, {
        success: true,
        msg: "Data Fetched",
        data: data,
      });
    } else {
      return rc.setResponse(res, {
        msg: "Data not Found",
      });
    }
  })
);

router.put(
  "/:id",
  auth,
  asyncHandler(async (req, res, next) => {
    const newData = req.body;
    newData.admin = req.user.id;
    if (req.user.role === "SuperAdmin") {
      if (req.body.role) {
        const query = { _id: req.params.id };
        const data = await TableModel.updateByQuery(query, newData);
        // console.log(data);
        if (data) {
          return rc.setResponse(res, {
            success: true,
            msg: "Data Fetched",
            data: data,
          });
        } else {
          return rc.setResponse(res, {
            msg: "Data not Found",
          });
        }
      } else {
        return rc.setResponse(res, { error: "Please fill Data properly" });
      }
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);
router.delete(
  "/:id",
  auth,
  asyncHandler(
    //FIXME:need to change country if required
    async (req, res, next) => {
      const admin = req.user.id;
      const id = req.params.id;
      query = { _id: req.params.id };
      if (req.user.role === "SuperAdmin") {
        const rdata = await TableModel.getDataByQueryFilterDataOne(query);
        query = { role: rdata.role };
        const count = await TableModelUser.getDataCountByQuery(query);
        if (!count) {
          const data = await TableModel.dataDeleteByQuery(query);
          if (data) {
            return rc.setResponse(res, {
              success: true,
              msg: "Deleted Successfully",
              data: data,
            });
          } else {
            return rc.setResponse(res, {
              msg: "Data not Found",
            });
          }
        } else {
          return rc.setResponse(res, {
            msg: "Can't Delete this Role it is using by some Users",
          });
        }
      } else {
        return rc.setResponse(res, { error: { code: 403 } });
      }
    }
  )
);
//FIXME:Not Using right now

module.exports = router;
