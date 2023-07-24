const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const rc = require("../controllers/responseController");

const machineslot = require("../model/m_machine_slot");
const machines = require("../model/m_machine");
const refillerrequest = require("../model/m_refiller_request");
const user_infos = require("../model/m_user_info");
const warehouseStock = require("../model/m_warehouse_Stock");
const TableModelPermission = require("../model/m_permission");
const product = require("../model/m_product");

const CsvParser = require("json2csv").Parser;
const csv = require("csv-parser");
const fs = require("fs");
const { upload } = require("../middleware/fileUpload");

//------------------------removed auth for now---------------------------------//

router.get(
  "/getallmachines",
  asyncHandler(async (req, res) => {
    const allmachine = await machines.find().select("machineid companyid");
    // console.log(allmachine);
    return rc.setResponse(res, {
      success: true,
      msg: "Data fetched",
      data: allmachine,
    });
  })
);

//------------------------get all slot details by machine Name------------------//
//------------------------removed auth for now ---------------------------------//
router.get(
  "/getallmachineslots",
  asyncHandler(async (req, res) => {
    const pararms = req.query;
    const data = await machineslot.find({ machineName: pararms.machineName });
    console.log(data);
    const machinedata = {
      machineID: data[0].machineid,
      machineName: data[0].machineName,
      admin: data[0].admin,
      machineSlot: data,
    };
    // console.log(machinedata)
    // return res.send(machinedata);
    return rc.setResponse(res, {
      success: true,
      msg: "Data fetched",
      data: machinedata,
    });
  })
);

//-------------------------Refiller post request--------------------------------//

// router.post(
//   "/refillerrequest",
//   auth,
//   asyncHandler(async (req, res) => {
//     const pararms = req.body;
//     // console.log(pararms);
//     if (req.user.role === "Refiller") {
//       let newRequest = new refillerrequest(pararms);
//       newRequest.refillerID = req.user.id;
//       if (!newRequest) {
//         return rc.setResponse(res, {
//           msg: "No Data to insert",
//         });
//       }
//       // console.log(pararms.machineSlot.length)
//       if (!newRequest.refillerID) {
//         return res.send({ message: "refiller ID is required" });
//       }

//       let machineSlott = [];
//       let newdata;

//       for (let i = 0; i < pararms.machineSlot.length; i++) {
//         newdata = {
//           slot: pararms.machineSlot[i].slot,
//           closingStock: pararms.machineSlot[i].closingStock,
//           currentStock: pararms.machineSlot[i].currentStock,
//           refillQuantity: pararms.machineSlot[i].refillQuantity,
//           saleQuantity: pararms.machineSlot[i].saleQuantity,
//           materialName: pararms.machineSlot[i].materialName,
//           slotid: pararms.machineSlot[i].slotid,
//         };
//         await machineSlott.push(newdata);
//       }

//       let randomNumber = Math.floor(Math.random() * 100000000000000);

//       let oldmachineslots = await machineslot.find({
//         machineName: pararms.machineId,
//       });
//       console.log(oldmachineslots);

//       let data = new refillerrequest({
//         refillerID: newRequest.refillerID,
//         refillRequestNumber: randomNumber,
//         machineId: pararms.machineId,
//         machineSlot: machineSlott,
//         oldmachineData: oldmachineslots,
//       });
//       await data.save();

//       if (data) {
//         return rc.setResponse(res, {
//           success: true,
//           msg: "Data Inserted",
//           // data: data,
//         });
//       }
//     } else {
//       return rc.setResponse(res, { error: { code: 403 } });
//     }
//   })
// );

//-------------------all refilling request---------------------------------//

router.get(
  "/allrefillingrequest",
  asyncHandler(async (req, res) => {
    const allRefillerRequest = await refillerrequest.find();
    // .select(
    //   "id refillerID refillRequestNumber machineId pendingstatus isDeleted createdAt updatedAt"
    // )
    // .populate("refillerID", ["_id", "first_name", "user_id"]);
    // return res.send(data);
    return rc.setResponse(res, {
      success: true,
      msg: "Data fetched",
      data: allRefillerRequest,
    });
  })
);

//------------------refilling request by id--------------------------------//

router.get(
  "/allrefillingrequestbyid",
  asyncHandler(async (req, res) => {
    const id = req.query.id;
    const refillerRequestById = await refillerrequest
      .find({ _id: id })
      .select(
        "id refillerID refillRequestNumber machineId machineSlot status isDeleted"
      )
      .populate("refillerID", ["_id", "first_name", "user_id"]);
    // console.log(data[0])
    // return res.send(data[0]);
    return rc.setResponse(res, {
      success: true,
      msg: "Data fetched",
      data: refillerRequestById[0],
    });
  })
);

//-------------------- testing refilling request approval --------------------------//

router.post("/testingpulldata", async (req, res) => {
  const pararms = req.body;
  const refillrequestid = req.query.id;
  const data = await refillerrequest
    .find({ _id: refillrequestid })
    .select(
      "id refillerID refillRequestNumber machineId machineSlot status isDeleted slotid"
    );
  // const update = await refillerrequest.findByIdAndUpdate({_id: refillrequestid}, {status: true})
  let dataslots = data[0].machineSlot;
  res.send(dataslots);
  if (data[0].status === false) {
    const approveedit = await machineslot.find({
      machineName: data[0].machineId,
    });
    // console.log(approveedit)
    console.log(approveedit);

    // const approveddata = await machineslot.findOneAndUpdate()
    // const approveddata = await machineslot.updateOne(
    //       { _id: req.params.id },
    //       {
    //         $set: {
    //           closingStock: pararms.closingStock,
    //           currentStock: pararms.currentStock,
    //           refillQuantity: pararms.refillQuantity,
    //           saleQuantity: pararms.saleQuantity,
    //         },
    //       }
    //     );
  }
  // return res.send(data);
});

//------------------for approveadmin request-------------------------//
router.post(
  "/approverefillrequest",
  auth,
  asyncHandler(
    async (req, res) => {
      const pararms = req.query;
      if (req.user.role === "SuperAdmin" || req.user.role === "Admin") {
        let rdata = await refillerrequest.find({
          refillRequestNumber: pararms.refillRequestNumber,
        });
        // console.log(rdata[0].machineSlots);

        let data;
        let approveddata;
        let updatedClosingStock;

        if (rdata[0].status === "Approved") {
          for (let i = 0; i < rdata[0].machineSlots.length; i++) {
            // console.log(rdata[0].machineSlots.length)
            let rslots = rdata[0].machineSlots[i].sloteid;
            // console.log(rdata[0].machineSlots[i].sloteid);

            const filter = { sloteid: rslots };
            const update = {
              $unset: {
                closingStock: 1,
                currentStock: 1,
                refillQuantity: 1,
                saleQuantity: 1,
              },
            };
            const options = {
              upsert: false,
            };
            data = await machineslot.updateOne(filter, update, options);
            // console.log(data);

            updatedClosingStock =
              rdata[0].machineSlots[i].currentStock +
              rdata[0].machineSlots[i].refillQuantity;
            // console.log(updatedClosingStock);
            // console.log(rdata[0].machineSlots[i].currentStock);
            // console.log(rdata[0].machineSlots[i].refillQuantity);
            approveddata = await machineslot.updateOne(
              { sloteid: rdata[0].machineSlots[i].sloteid },
              {
                $set: {
                  closingStock: updatedClosingStock,
                  currentStock: rdata[0].machineSlots[i].currentStock,
                  refillQuantity: rdata[0].machineSlots[i].refillQuantity,
                  saleQuantity: rdata[0].machineSlots[i].saleQuantity,
                  // materialName: rdata[0].machineSlots[i].materialName,
                },
              },
              options
            );
          }
          // console.log(approveddata);
          if (approveddata) {
            const updaterdata = await refillerrequest.findOneAndUpdate(
              { refillRequestNumber: pararms.refillRequestNumber },
              { status: "Approved" }
            );
            // if(updaterdata.status === "Approved"){
            // const updatewarehousestock = await warehouseStock.updateOne(
            //   {
            //     warehouse: updaterdata.warehouse,
            //     product: updaterdata.machineSlots[i].product,
            //   },
            //   { $inc: { productQuantity: - updaterdata.machineSlots[i].refillQuantity } }
            // );
            // }
            console.log(updaterdata.machineSlots);
            return rc.setResponse(res, {
              success: true,
              msg: "data updated",
            });
          }
        } else {
          return rc.setResponse(res, {
            success: false,
            msg: "Request is already approved",
          });
        }
      } else {
        return rc.setResponse(res, { error: { code: 403 } });
      }
      return res.send("done");
    }
    // }
  )
);

router.get(
  "/refillingproductchangerequest",
  asyncHandler(async (req, res) => {
    const pararms = req.query;
    const rdata = await refillerrequest
      .find({ refillRequestNumber: pararms.refillRequestNumber })
      .select("_id refillerID refillRequestNumber machineId machineSlot");
    let updateRData = [];
    for (let i = 0; i < rdata[0].machineSlot.length; i++) {
      // console.log("----------------------loop------------");
      if (rdata[0].machineSlots[i].refillQuantity <= 0) {
        // console.log("less than 0");
        updateRData.push(rdata[0].machineSlots[i]);
      }
    }
    console.log(rdata[0].id);
    const data = {};
    return rc.setResponse(res, {
      success: true,
      msg: "got data",
      data: updateRData,
    });
  })
);

// router.put(
//   "/updaterefillingproducts",
//   asyncHandler(async (req, res) => {
//     const pararms = req.body;
//     const updatedSlotId = pararms.requestId

//     const updatedSlots = {
//       slot: pararms.slot,
//       closingStock: pararms.closingStock,
//       currentStock: pararms.currentStock,
//       refillQuantity: pararms.refillQuantity,
//       saleQuantity: pararms.saleQuantity,
//       materialName: pararms.materialName,
//     };

//     const rdata = await refillerrequest.findByIdAndUpdate(
//       { _id: req.query.id },
//       {
//         $set: {
//           "machineSlot.$[elem]": updatedSlots,
//         },
//       },
//       {
//         new: true,
//         arrayFilters: [{ "elem._id": updatedSlotId }],
//       }
//     );
//     return rc.setResponse(res, {
//       success: true,
//       msg: "data updated",
//       data: rdata,
//     });
//   })
// );

// Sample csv file for bulk upload slots

// sample csv file for bulk upload slots
router.get(
  "/MachineSlot/SampleCSV",
  auth,
  asyncHandler(async (req, res) => {
    console.log("----------------xdxdxgxg--------");
    const query = {
      role: req.user.role,
    };
    // console.log(query);
    let cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    // console.log(cdata);
    if (cdata.updatebulkproduct) {
      const j = {
        machineid: "",
        slot: "",
        maxquantity: "",
        product: "",
      };
      const csvFields = ["machineid", "slot", "maxquantity", "product"];
      const csvParser = new CsvParser({ csvFields });
      const csvdata = csvParser.parse(j);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=SampleImportMachineSLot.csv"
      );
      res.status(200).end(csvdata);
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

// bulk Upload Slots
router.post(
  "/MachineSlot/ImportCSV",
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
              results[i].slot == "" ||
              results[i].slot == "NA" ||
              results[i].slot == "#N/A"
            ) {
              console.log(`Slot is not available`);
              console.log(results[i]);
              results[i].error = "Slot is missing";
              const r = reject(results[i]);
            } else if (
              results[i].maxquantity == "" ||
              results[i].maxquantity == "NA" ||
              results[i].maxquantity == "#N/A"
            ) {
              console.log(`Max_Quantity is not available`);
              console.log(results[i]);
              results[i].error = "Max_Quantity is missing";
              const r = reject(results[i]);
            } else if (
              results[i].product == "" ||
              results[i].product == "NA" ||
              results[i].product == "#N/A"
            ) {
              console.log(`Product is not available`);
              console.log(results[i]);
              results[i].error = "Product is missing";
              const r = reject(results[i]);
            } else {
              try {
                // const machineslotdata = await machineslot.find({ $and:[{machineid: results[i].machineid}, {slot: results[i].slot}]})
                // console.log("machineslotdata",machineslotdata.length);
                // if(machineslotdata.length > 0){
                //   return res.status(500).send("Slot is already created");
                // }

                // let newRow = new machineslot(results[i]);

                const productdata = await product.findOne({
                  productname: results[i].product,
                });
                const machinedata = await machines.findOne({
                  machineid: results[i].machineid,
                });
                let newRow = {
                  machineid: machinedata._id,
                  slot: results[i].slot,
                  maxquantity: results[i].maxquantity,
                  product: productdata._id,
                  machineName: machinedata.machineid,
                  created_by: req.user.id,
                  admin: req.user.id,
                };
                const newData = await machineslot(newRow);
                await newData.save();
                if (newData) {
                  const r = succ(results[i]);
                }
              } catch (e) {
                console.log(e);
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
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

// Export all slots of machine
router.get(
  "/MachineSlot/ExportCSV",
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
      let data = await machineslot.find({ machineName: req.query.machine });
      // console.log("🚀 ~ file: r_product.js:30 ~ data:", data)
      if (!(data.length == 0)) {
        for (i = 0; i < data.length; i++) {
          let productdata = await product.findOne({ _id: data[i].product });
          let admin = await user_infos.findOne({ _id: data[i].admin });
          // console.log("productdata",productdata)
          const j = {
            machineName: data[i].machineName,
            slot: data[i].slot,
            product: productdata.productname,
            maxquantity: data[i].maxquantity,
            admin: admin.first_name,
            closingStock: data[i].closingStock,
            currentStock: data[i].currentStock,
            saleQuantity: data[i].saleQuantity,
          };
          //  console.log(j);
          transaction(j);
          // console.log(trans);
        }
        const csvFields = [
          "machineName",
          "slot",
          "product",
          "maxquantity",
          "admin",
          "closingStock",
          "currentStock",
          "saleQuantity",
        ];
        const csvParser = new CsvParser({ csvFields });
        const csvData = csvParser.parse(trans);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=MachineSlots.csv"
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

// get request pagination machineslots data
router.get(
  "/MachineSlot/Table/:machineid/:page/:dataperpage",
  auth,
  asyncHandler(async (req, res, next) => {
    const page = req.params.page;
    const dataperpage = req.params.dataperpage;
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.productlist) {
      const machinedata = await machines.findOne({ machineid: req.params.machineid });
      // console.log("machinedata:", machinedata);
      const admin = req.user.id;
      const data = await machineslot.getDataforTablePagination(
        machinedata.machineid,
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

module.exports = router;
