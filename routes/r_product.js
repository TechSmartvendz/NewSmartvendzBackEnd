const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const CsvParser = require("json2csv").Parser;
const csv = require("csv-parser");
const fs = require("fs");

const rc = require("../controllers/responseController");
const { asyncHandler } = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");
const { upload } = require("../middleware/fileUpload");

const TableModelUser = require("../model/m_user_info");
const TableModelMachineSlot = require("../model/m_machine_slot");
const TableModelPermission = require("../model/m_permission");
const TableModelCompany = require("../model/m_company");
const TableModel = require("../model/m_product");
const gstTable = require("../model/gst");

//permissions
//updatebulkproduct
//singleproductadd
//bulkproductupload
//productlist
//products

router.get(
  "/SampleCSV",
  auth,
  asyncHandler(async (req, res, next) => {
    const page = req.params.page;
    const dataperpage = req.params.dataperpage;
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.updatebulkproduct) {
      const j = {
        productid: "",
        productname: "",
        description: "",
        materialtype: "",
        sellingprice: "",
        mass: "",
        unit: "",
        // HSN_code: "",
      };
      const csvFields = [
        "productid",
        "productname",
        "description",
        "materialtype",
        "sellingprice",
        "mass",
        "unit",
        // "HSN_code",
      ];
      const csvParser = new CsvParser({ csvFields });
      const csvdata = csvParser.parse(j);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=Product_List.csv"
      );
      res.status(200).end(csvdata);
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);
router.post(
  "/ExportCSV",
  auth,
  asyncHandler(async (req, res) => {
    var trans = [];
    function transaction(x) {
      if (x) {
        trans.push(x);
      }
      return trans;
    }
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.bulkproductupload) {
      const query = req.body;
      let data = await TableModel.getDataforCSVWithQuery(query);
      console.log("🚀 ~ file: r_product.js:30 ~ data:", data);
      if (!(data.lenght == 0)) {
        for (i = 0; i < data.length; i++) {
          const j = {
            productid: data[i].productid,
            productname: data[i].productname,
            description: data[i].description,
            materialtype: data[i].materialtype,
            sellingprice: data[i].sellingprice,
            mass: data[i].mass,
            unit: data[i].unit,
            // HSN_code: data[i].HSN_code,
          };
          console.log(j);
          transaction(j);
          console.log(trans);
        }
        const csvFields = [
          "productid",
          "productname",
          "description",
          "materialtype",
          "sellingprice",
          "mass",
          "unit",
          "HSN_code",
        ];
        const csvParser = new CsvParser({ csvFields });
        const csvData = csvParser.parse(trans);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=Product_List.csv"
        );
        res.status(200).end(csvData);
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
router.post(
  "/ImportCSV",
  auth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const results = [];
    var rejectdata = [];
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
      console.log("🚀 ~ file: r_product.js:109 ~ path:", path);
      fs.createReadStream(path)
        .pipe(csv({}))
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          // console.log(results);
          for (i = 0; i < results.length; i++) {
            if (
              results[i].productid == "" ||
              results[i].productid == "NA" ||
              results[i].productid == "#N/A"
            ) {
              console.log(`productid is not available`);
              console.log(results[i]);
              results[i].error = "productid is missing";
              const r = reject(results[i]);
            } else if (
              results[i].productname == "" ||
              results[i].productname == "NA" ||
              results[i].productname == "#N/A"
            ) {
              console.log(`productname is not available`);
              console.log(results[i]);
              results[i].error = "productname is missing";
              const r = reject(results[i]);
            } else if (
              results[i].materialtype == "" ||
              results[i].materialtype == "NA" ||
              results[i].materialtype == "#N/A"
            ) {
              console.log(`materialtype is not available`);
              console.log(results[i]);
              results[i].error = "materialtype is missing";
              const r = reject(results[i]);
            }
            // else if (
            //   results[i].HSN_code == "" ||
            //   results[i].HSN_code == "NA" ||
            //   results[i].HSN_code == "#N/A"
            // ) {
            //   console.log(`HSN_code is not available`);
            //   console.log(results[i]);
            //   results[i].error = "HSN_code is missing";
            //   const r = reject(results[i]);
            // }
            else {
              try {
                // const hsncodedata = await gsttable.findOne({
                //   hsn_Code: results[i].HSN_code,
                // });
                newRow = new TableModel(results[i]);
                newRow.admin = req.user._id;
                // newRow.HSN_code = hsncodedata._id;
                const data = await TableModel.addRow(newRow);
                console.log('data: ', data);
                if (data) {
                  const r = succ(results[i]);
                }
              } catch (e) {
                if (e.code == 11000) {
                  console.log(e)
                  results[i].error = "Duplicate Entry";
                  const r = reject(results[i]);
                }
              }
            }
          }
          // const r= reject();
          console.log("storeddata",storeddata.length);
          console.log("rejectdata",rejectdata);
          console.log("rejectdata",rejectdata.length);

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
            // res.status(200).json({ "dataupload": "error", "reject_data": rejectdata, "stored_data": storeddata.length });
          } else {
            return rc.setResponse(res, {
              success: true,
              msg: "Data Fetched",
              data: { dataupload: "success", stored_data: storeddata.length },
            });
          }
        });
    // return res.send("ok")
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
  "/Table/:page/:dataperpage",
  auth,
  asyncHandler(async (req, res, next) => {
    const page = req.params.page;
    const dataperpage = req.params.dataperpage;
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.productlist) {
      const admin = req.user.id;
      const data = await TableModel.getDataforTablePagination(
        page,
        dataperpage
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
router.post(
  "/Search/:page/:dataperpage",
  auth,
  asyncHandler(async (req, res) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.productlist) {
      const page = req.params.page;
      const dataperpage = req.params.dataperpage;
      const query = req.body;
      const data = await TableModel.getDataforTablePaginationWithQuery(
        page,
        dataperpage,
        query
      );
      console.log("🚀 ~ file: r_product.js:30 ~ data:", data);
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
  "/:id",
  auth,
  asyncHandler(async (req, res, next) => {
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.addnewmachine) {
      const id = req.params.id;
      const query = {
        _id: id,
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
// router.post('/Slot', auth, asyncHandler(
//     async (req, res) => {
//         const query = {
//             role: req.user.role
//         }
//         var pdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
//         if (pdata.addnewmachine) {
//             const query = {
//                 machineid: req.body.machineid
//             }
//             var cdata = await TableModel.getDataByQueryFilterDataOne(query);
//             // console.log("🚀 ~ file: r_company.js:195 ~ cdata", cdata)
//             if (!cdata) {
//                 return rc.setResponse(res, {
//                     msg: 'Machine not Found'
//                 });
//             } else {
//                 var newRow = req.body
//                 newRow.created_by = req.user.id
//                 newRow.machineid = cdata.id
//                 newRow.admin = req.user.id
//                 newRow = new TableModelMachineSlot(newRow);

//                 if (!newRow) {
//                     return rc.setResponse(res, {
//                         msg: 'No Data to insert'
//                     });
//                 }
//                 const data = await TableModelMachineSlot.addRow(newRow);
//                 if (data) {
//                     return rc.setResponse(res, {
//                         success: true,
//                         msg: 'Data Inserted',
//                         data: data
//                     });
//                 }
//             }
//         } else {
//             return rc.setResponse(res, { error: { code: 403 } });
//         }
//     }
// )
// );
// router.put('/Slot/:id', auth, asyncHandler(
//     async (req, res) => {
//         const query = {
//             role: req.user.role
//         }
//         var pdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
//         if (pdata.addnewmachine) {
//             let query = {
//                 machineid: req.body.machineid
//             }
//             var cdata = await TableModel.getDataByQueryFilterDataOne(query);
//             console.log("🚀 ~ file: r_machine.js:242 ~ cdata:", cdata)
//             if (!cdata) {
//                 return rc.setResponse(res, {
//                     msg: 'Machine not Found'
//                 });
//             } else {
//                 var newRow = req.body
//                 newRow.created_by = req.user.id
//                 newRow.machineid = cdata.id
//                 query = {
//                     _id: req.params.id
//                 }
//                 var newRow = await TableModelMachineSlot.updateByQuery(query, newRow);
//                 if (!newRow) {
//                     return rc.setResponse(res, {
//                         msg: 'No Data to update'
//                     });
//                 }
//                 else {
//                     return rc.setResponse(res, {
//                         success: true,
//                         msg: 'Machine Updated',
//                         data: newRow
//                     });
//                 }
//             }
//         } else {
//             return rc.setResponse(res, { error: { code: 403 } });
//         }
//     }
// )
// );
// router.delete('/Slot/:id', auth, asyncHandler(
//     async (req, res) => {
//         const query = {
//             role: req.user.role
//         }
//         var pdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
//         if (pdata.addnewmachine) {
//             let query = {
//                 _id: req.params.id
//             }
//             var data = await TableModelMachineSlot.dataDeleteByQuery(query);
//             if (!data) {
//                 return rc.setResponse(res, {
//                     msg: 'Slot not Found'
//                 });
//             } else {
//                 return rc.setResponse(res, {
//                     success: true,
//                     msg: 'Data Deleted',
//                     data: data
//                 });
//             }
//         } else {
//             return rc.setResponse(res, { error: { code: 403 } });
//         }
//     }
// )
// );
// router.get('/Slot/:id', auth, asyncHandler(
//     async (req, res, next) => {
//         const query = {
//             role: req.user.role
//         }
//         var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
//         if (cdata.addnewmachine) {

//             const query = {
//                 _id: req.params.id
//             }
//             var cdata = await TableModel.getDataByQueryFilterDataOne(query);
//             if (cdata.machineid) {
//                 const machineid = cdata.id
//                 const data = await TableModelMachineSlot.getDataforTable(machineid);
//                 if (data) {
//                     return rc.setResponse(res, {
//                         success: true,
//                         msg: 'Data Fetched',
//                         data: data
//                     });
//                 } else {
//                     return rc.setResponse(res, {
//                         msg: "Data not Found"
//                     })
//                 }
//             } else {
//                 return rc.setResponse(res, {
//                     msg: "Data not Found"
//                 })
//             }
//         }
//         else {
//             return rc.setResponse(res, { error: { code: 403 } });
//         }
//     }
// )
// );
// router.get('/Slot/:id/:slotid', auth, asyncHandler(
//     async (req, res, next) => {
//         const query = {
//             role: req.user.role
//         }
//         var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
//         if (cdata.addnewmachine) {

//             let _id = req.params.slotid
//             console.log("🚀 ~ file: r_company.js:276 ~ slote _id", _id)
//             const data = await TableModelMachineSlot.getDataForEditFormAssignUser(_id);
//             if (data) {
//                 return rc.setResponse(res, {
//                     success: true,
//                     msg: 'Data Fetched',
//                     data: data
//                 });
//             } else {
//                 return rc.setResponse(res, {
//                     msg: "Data not Found"
//                 })
//             }

//         }
//         else {
//             return rc.setResponse(res, { error: { code: 403 } });
//         }
//     }
// )
// );

module.exports = router;
