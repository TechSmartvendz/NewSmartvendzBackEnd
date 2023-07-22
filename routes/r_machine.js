const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const rc = require("../controllers/responseController");
const auth = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");

const TableModelUser = require("../model/m_user_info");
const TableModelMachineSlot = require("../model/m_machine_slot");
const TableModelPermission = require("../model/m_permission");
const TableModelCompany = require("../model/m_company");
const TableModel = require("../model/m_machine");
const product = require("../model/m_product");
//permissions
//machineconfiguration
//listmachine
//managemachine
//addnewmachine

router.post(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.addnewmachine) {
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
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);
router.get(
  "/",
  auth,
  asyncHandler(async (req, res, next) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.listcompany) {
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
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);
router.get(
  "/Datalist",
  auth,
  asyncHandler(
    //getDataListByQuery
    async (req, res, next) => {
      const query = {
        admin: req.user.id,
      };
      const data = await TableModel.getDataListByQuery(query);
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
  "/:id",
  auth,
  asyncHandler(async (req, res, next) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.addnewmachine) {
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
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);
router.put(
  "/:id",
  auth,
  asyncHandler(async (req, res, next) => {
    const newData = req.body;
    newData.admin = req.user.id;
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.addnewcompany) {
      const query = { _id: req.params.id };
      const data = await TableModel.updateByQuery(query, newData);
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
      let query = {
        role: req.user.role,
      };
      var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
      if (cdata.addnewcompany) {
        const id = req.params.id;
        query = { _id: req.params.id };
        // const rdata = await TableModel.getDataByQueryFilterDataOne(query);
        // query={role:rdata.role}
        // const count = await TableModelUser.getDataCountByQuery(query);
        // if(!count){
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

        // }else{
        //     return rc.setResponse(res, {
        //         msg: "Can't Delete this Role it is using by some Users"
        //     })
        // }
      } else {
        return rc.setResponse(res, { error: { code: 403 } });
      }
    }
  )
);
//FIXME:Not Using right now
router.post(
  "/Slot",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    var pdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (pdata.addnewmachine) {
      const query = {
        machineid: req.body.machineid,
      };
      var cdata = await TableModel.getDataByQueryFilterDataOne(query);
      console.log(cdata);
      // console.log("🚀 ~ file: r_company.js:195 ~ cdata", cdata)
      if (!cdata) {
        return rc.setResponse(res, {
          msg: "Machine not Found",
        });
      } else {
        const productdata = await product.findOne({
          productname: req.body.product,
        });
        var newRow = req.body;
        newRow.created_by = req.user.id;
        newRow.machineid = cdata.id;
        newRow.admin = req.user.id;
        newRow.machineName = cdata.machineid;
        newRow.product = productdata._id;
        newRow = new TableModelMachineSlot(newRow);
        console.log(newRow);

        if (!newRow) {
          return rc.setResponse(res, {
            msg: "No Data to insert",
          });
        }
        const data = await TableModelMachineSlot.addRow(newRow);
        if (data) {
          return rc.setResponse(res, {
            success: true,
            msg: "Data Inserted",
            data: data,
          });
        }
      }
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);
router.put(
  "/Slot/:id",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    var pdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (pdata.addnewmachine) {
      let query = {
        machineid: req.body.machineid,
      };
      var cdata = await TableModel.getDataByQueryFilterDataOne(query);
      console.log("🚀 ~ file: r_machine.js:242 ~ cdata:", cdata);
      if (!cdata) {
        return rc.setResponse(res, {
          msg: "Machine not Found",
        });
      } else {
        const productdata = await product.findOne({
          productname: req.body.product,
        });
        let newRow = req.body;
        newRow.created_by = req.user.id;
        newRow.machineid = cdata.id;
        newRow.product = productdata._id;
        console.log(newRow);
        query = {
          _id: req.params.id,
        };
        let data = await TableModelMachineSlot.updateByQuery(query, newRow);
        if (!data) {
          return rc.setResponse(res, {
            msg: "No Data to update",
          });
        } else {
          return rc.setResponse(res, {
            success: true,
            msg: "Machine Updated",
            data: newRow,
          });
        }
      }
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

router.delete(
  "/Slot/:id",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    var pdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (pdata.addnewmachine) {
      let query = {
        _id: req.params.id,
      };
      var data = await TableModelMachineSlot.dataDeleteByQuery(query);
      if (!data) {
        return rc.setResponse(res, {
          msg: "Slot not Found",
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Deleted",
          data: data,
        });
      }
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

router.get(
  "/Slot/:id",
  auth,
  asyncHandler(async (req, res, next) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.addnewmachine) {
      const query = {
        _id: req.params.id,
      };
      var cdata = await TableModel.getDataByQueryFilterDataOne(query);
      if (cdata.machineid) {
        const machineid = cdata.id;
        const data = await TableModelMachineSlot.getDataforTable(machineid);
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
        return rc.setResponse(res, {
          msg: "Data not Found",
        });
      }
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);
router.get(
  "/Slot/:id/:slotid",
  auth,
  asyncHandler(async (req, res, next) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.addnewmachine) {
      let _id = req.params.slotid;
      console.log("🚀 ~ file: r_company.js:276 ~ slote _id", _id);
      const data = await TableModelMachineSlot.getDataForEditFormAssignUser(
        _id
      );
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
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

module.exports = router;
