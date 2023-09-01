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
const warehouse = require("../model/m_warehouse");
const userDetails = require("../model/m_user_info");

const CsvParser = require("json2csv").Parser;
const csv = require("csv-parser");
const fs = require("fs");
const { upload } = require("../middleware/fileUpload");
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
      // console.log(req.body);
      const warehousedata = await warehouse.findOne({
        wareHouseName: req.body.warehouse,
      });
      newRow = new TableModel(req.body);
      newRow.admin = req.user._id;
      newRow.warehouse = warehousedata._id;
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

// Sample upload Machine
router.get(
  "/SampleCSV",
  auth,
  asyncHandler(async (req, res) => {
    // console.log("----------------xdxdxgxg--------");
    const query = {
      role: req.user.role,
    };
    // console.log(query);
    let cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    // console.log(cdata);
    if (cdata.updatebulkproduct) {
      const j = {
        machineid: "",
        machinename: "",
        companyid: "",
        warehouse: "",
        // refiller: "",
        // building: "",
        location: "",
        // producttype: "",
        totalslots: "",
      };
      const csvFields = [
        "machineid",
        "machinename",
        "companyid",
        "warehouse",
        "refiller",
        "building",
        "location",
        "producttype",
        "totalslots",
      ];
      const csvParser = new CsvParser({ csvFields });
      const csvdata = csvParser.parse(j);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=SampleImportMachine.csv"
      );
      res.status(200).end(csvdata);
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

// bulk Upload Machines
router.post(
  "/bulkUpload/ImportCSV",
  auth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const results = [];
    var rejectdata = [];
    let rejectmachines = [];

    function rejectmachinedata(x) {
      if (x) {
        rejectmachines.push(x);
      }
      return rejectmachines;
    }

    function reject(x) {
      if (x) {
        rejectdata.push(x);
      }
      return rejectdata;
    }

    var storeddata = [];

    function succ(x) {
      if (x) {
        storeddata.push(x);
      }
      return storeddata;
    }
    const query = { role: req.user.role };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);

    if (cdata.bulkproductupload) {
      var path = `public/${req.file.filename}`;
      fs.createReadStream(path)
        .pipe(csv({}))
        .on("data", async (data) => results.push(data))

        .on("end", async () => {
          console.log("result", results);
          for (i = 0; i < results.length; i++) {
            if (
              results[i].machineid == "" ||
              results[i].machineid == "NA" ||
              results[i].machineid == "#N/A"
            ) {
              console.log(`MachineId is not available`);
              console.log(results[i]);
              results[i].error = "MachineId is missing";
              const r = reject(results[i]);
            } else if (
              results[i].machinename == "" ||
              results[i].machinename == "NA" ||
              results[i].machinename == "#N/A"
            ) {
              console.log(`machinename is not available`);
              console.log(results[i]);
              results[i].error = "machinename is missing";
              const r = reject(results[i]);
            } else if (
              results[i].companyid == "" ||
              results[i].companyid == "NA" ||
              results[i].companyid == "#N/A"
            ) {
              console.log(`Max_Quantity is not available`);
              console.log(results[i]);
              results[i].error = "Max_Quantity is missing";
              const r = reject(results[i]);
            } else if (
              results[i].warehouse == "" ||
              results[i].warehouse == "NA" ||
              results[i].warehouse == "#N/A"
            ) {
              console.log(`warehouse is not available`);
              console.log(results[i]);
              results[i].error = "warehouse is missing";
              const r = reject(results[i]);
            } else if (
              results[i].refiller == "" ||
              results[i].refiller == "NA" ||
              results[i].refiller == "#N/A"
            ) {
              console.log(`refiller is not available`);
              console.log(results[i]);
              results[i].error = "refiller is missing";
              const r = reject(results[i]);
            }
            //  else if (
            //   results[i].buiding == "" ||
            //   results[i].buiding == "NA" ||
            //   results[i].buiding == "#N/A"
            // ) {
            //   console.log(`buiding is not available`);
            //   console.log(results[i]);
            //   results[i].error = "buiding is missing";
            //   const r = reject(results[i]);
            // }
            else if (
              results[i].location == "" ||
              results[i].location == "NA" ||
              results[i].location == "#N/A"
            ) {
              console.log(`location is not available`);
              console.log(results[i]);
              results[i].error = "location is missing";
              const r = reject(results[i]);
            }
            // else if (
            //   results[i].producttype == "" ||
            //   results[i].producttype == "NA" ||
            //   results[i].producttype == "#N/A"
            // ) {
            //   console.log(`producttype is not available`);
            //   console.log(results[i]);
            //   results[i].error = "producttype is missing";
            //   const r = reject(results[i]);
            // }
            else if (
              results[i].totalslots == "" ||
              results[i].totalslots == "NA" ||
              results[i].totalslots == "#N/A"
            ) {
              console.log(`totalslots is not available`);
              console.log(results[i]);
              results[i].error = "totalslots is missing";
              const r = reject(results[i]);
            } else {
              try {
                const checkMachine = await TableModel.find({
                  machineid: results[i].machineid,
                });
                // console.log("machineslotdata",machineslotdata.length);
                if (checkMachine) {
                  rejectmachinedata(checkMachine);
                  // return res.status(500).send("Machine is already created");
                }

                const warehousedata = await warehouse.findOne({
                  wareHouseName: results[i].warehouse,
                });
                const refillerdata = await TableModelUser.findOne({
                  first_name: results[i].refiller,
                });
                const companydata = await TableModelCompany.findOne({
                  companyid: results[i].companyid,
                });

                let newRow = {
                  machineid: results[i].machineid,
                  machinename: results[i].machinename,
                  companyid: companydata.companyid,
                  warehouse: warehousedata._id,
                  refiller: refillerdata.user_id,
                  // building: results[i].building,
                  location: results[i].location,
                  // producttype: results[i].producttype,
                  totalslots: results[i].totalslots,
                  admin: req.user._id,
                };
                const newData = await TableModel(newRow);
                // console.log(newData);
                await newData.save();
                if (newData) {
                  const r = succ(results[i]);
                }
              } catch (e) {
                // console.log(e);
                if (e.code == 11000) {
                  results[i].error = "Duplicate Entry";
                  const r = reject(results[i]);
                } else {
                  results[i].error = e;
                  const r = reject(results[i]);
                }
              }
            }
          }
          // const r= reject();
          console.log("storeddata.length", storeddata.length);
          console.log("rejectdata", rejectdata);
          console.log("rejectdata.length", rejectdata.length);
          console.log("rejectmachines", rejectmachines);
          console.log("rejectmachines", rejectmachines.length);

          if (rejectdata.length > 0) {
            return rc.setResponse(res, {
              success: true,
              msg: "Data Fetched",
              data: {
                dataupload: "partial upload",
                reject_data: rejectdata,
                stored_data: storeddata.length,
              },
            });
          } else {
            return rc.setResponse(res, {
              success: true,
              msg: "Data Fetched",
              data: { dataupload: "success", stored_data: storeddata.length },
            });
          }
        });
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
      if (req.user.role == "Admin") {
        console.log("admin");
        const adminId = req.user.admin;
        const checkdata = await TableModel.find({ admin: req.user._id }).select(
          "_id machineid machinename totalslots warehouse admin refiller created_at"
        );

        const warehouseIds = checkdata
          .map((item) => item.warehouse)
          .filter(Boolean);
        const adminIds = checkdata.map((item) => item.admin).filter(Boolean);
        const refillerIds = checkdata
          .map((item) => item.refiller)
          .filter(Boolean);

        const [warehouses, admins, refillers] = await Promise.all([
          warehouse
            .find({ _id: { $in: warehouseIds } })
            .select("_id wareHouseName"),
          userDetails.find({ _id: { $in: adminIds } }).select("_id first_name"),
          userDetails
            .find({ user_id: { $in: refillerIds } })
            .select("_id first_name"),
        ]);

        const data = checkdata.map((item) => {
          const warehouse = warehouses.find(
            (wh) => wh._id.toString() === item.warehouse
          );
          const admin = admins.find((ad) => ad._id.toString() === item.admin);
          const refiller = refillers.find(
            (ref) => ref._id.toString() === item.refiller
          );

          return {
            _id: item._id,
            machineid: item.machineid,
            machineName: item.machinename,
            totalslots: item.totalslots,
            warehouse: warehouse ? warehouse.wareHouseName : "",
            admin: admin ? admin.first_name : "",
            refiller: refiller ? refiller.first_name : "",
            created_at: item.created_at,
          };
        });

        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: data,
        });
      }
      else{
        const admin = req.user.id;
        // console.log('admin: ', admin);
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
      // const role = req.params.id;
      // const query = {
      //   _id: role,
      // };
      // const data = await TableModel.getDataByQueryFilterDataOne(query);
      const machineid = req.params.id;
      const data = await TableModel.getDataByQueryFilterDataOneAggregate(
        machineid
      );
      // console.log("data",data)
      if (data) {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: data[0],
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
    const warehousedata = await warehouse.findOne({
      wareHouseName: req.body.warehouse,
    });
    const newData = req.body;
    newData.admin = req.user.id;
    newData.warehouse = warehousedata._id;
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.addnewcompany) {
      const query = { machineid: req.params.id };
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
