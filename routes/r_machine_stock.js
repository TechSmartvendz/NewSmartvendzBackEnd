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

router.get(
  "/getallmachines",
  auth,
  asyncHandler(async (req, res) => {
    // console.log(req.user._id)
    const query = {
      role: req.user.role,
    };
    const permissions = await TableModelPermission.getDataByQueryFilterDataOne(
      query
    );
    if (!permissions.listmachine) {
      return rc.setResponse(res, {
        success: false,
        msg: "No permisson to find data",
        data: {},
      });
    }
    let filter = {};
    if(req.user.role == "SuperAdmin" || req.user.role == "Admin"){
      filter = {}
    }
    if(req.user.role == "Refiller"){
      filter = {refiller: req.user.user_id}
    }
    const allmachine = await machines.find(filter);
    // .select("machineid companyid");
    // console.log(allmachine);
    return rc.setResponse(res, {
      success: true,
      msg: "Data fetched",
      data: allmachine,
    });
  })
);

//------------------------get all slot details by machine Name------------------//
// router.get(
//   "/getallmachineslots",
//   auth,
//   asyncHandler(async (req, res) => {
//     const query = {
//       role: req.user.role,
//     };
//     const permissions = await TableModelPermission.getDataByQueryFilterDataOne(
//       query
//     );
//     if (!permissions.listMachineSlot) {
//       return rc.setResponse(res, {
//         success: false,
//         msg: "No permisson to find data",
//         data: {},
//       });
//     }
//     const data = await machineslot.find({ machineid: req.query.machineid });
//     // const machine = await machines.findOne({_id: req.query.machineid}).select("cash totalSalesCount salesValue");
//     // console.log('machine: ', machine);
//     // console.log("data", data);
//     let productdata;
//     let pdata = [];
//     let sendData;
//     let ss = [];
//     for (let i = 0; i < data.length; i++) {
//       productdata = await product.findOne({ _id: data[i].product });
//       // console.log('productdata: ', productdata);
//       pdata.push(productdata);

//       sendData = {
//         _id: data[i]._id,
//         machineid: data[i].machineid,
//         machineName: data[i].machineName,
//         slot: data[i].slot,
//         maxquantity: data[i].maxquantity,
//         active_status: data[i].active_status,
//         productid: pdata[i]._id,
//         productname: pdata[i].productname,
//         sloteid: data[i].sloteid,
//         closingStock: data[i].closingStock,
//         currentStock: null,
//         refillQuantity: null,
//         saleQuantity: null,
//         delete_status: data[i].delete_status,
//         created_at: data[i].created_at,
//       };
//       ss.push(sendData);
//     }
//     ss.sort((a, b) => a.slot - b.slot);
//     // console.log("ss", ss);
//     const machinedata = {
//       machineId: data[0].machineid,
//       machineName: data[0].machineName,
//       admin: data[0].admin,
//       machineSlot: ss,
//       // cash: machine.cash,
//       // totalSalesCount: machine.totalSalesCount,
//       // salesValue: machine.salesValue
//     };
//     // console.log('machinedata: ', machinedata);
//     return rc.setResponse(res, {
//       success: true,
//       msg: "Data fetched",
//       data: machinedata,
//     });
//   })
// );

router.get(
  "/getallmachineslots",
  auth,
  asyncHandler(async (req, res) => {
    try {
      const query = {
        role: req.user.role,
      };
      const permissions = await TableModelPermission.getDataByQueryFilterDataOne(query);
      if (!permissions.listMachineSlot) {
        return rc.setResponse(res, {
          success: false,
          msg: "No permission to find data",
          data: {},
        });
      }
      const machinePromise = machines.findOne({ _id: req.query.machineid }).select("cash totalSalesCount salesValue").exec();
      const dataPromise = await machineslot.find({ machineid: req.query.machineid }).populate('product');

      const [machine, data] = await Promise.all([machinePromise, dataPromise]);

      const productDataMap = {};
      const productIds = [];
      for (const entry of data) {
        productIds.push(entry.product);
        productDataMap[entry.product.toString()] = entry.product;
      }

      const products = await Promise.all(productIds.map(productId => product.findById(productId)));

      const machineSlotData = data.map(entry => ({
        _id: entry._id,
        machineid: entry.machineid,
        machineName: entry.machineName,
        slot: entry.slot,
        maxquantity: entry.maxquantity,
        active_status: entry.active_status,
        productid: entry.product.toString(),
        productname: productDataMap[entry.product.toString()].productname,
        sloteid: entry.sloteid,
        closingStock: entry.closingStock,
        currentStock: null,
        refillQuantity: null,
        saleQuantity: null,
        delete_status: entry.delete_status,
        created_at: entry.created_at,
      }));
      machineSlotData.sort((a, b) => a.slot - b.slot);
      const machineInfo = {
        machineId: data[0].machineid,
        machineName: data[0].machineName,
        admin: data[0].admin,
        cash: machine.cash,
        totalSalesCount: machine.totalSalesCount,
        salesValue: machine.salesValue,
        machineSlot: machineSlotData,
      };

      return rc.setResponse(res, {
        success: true,
        msg: "Data fetched",
        data: machineInfo,
      });
    } catch (error) {
      console.error("Error:", error);
      return rc.setResponse(res, {
        success: false,
        msg: "An error occurred",
        data: {},
      });
    }
  })
);


// ---------------- check with aggregation ---------------------------//
// router.get(
//   "/getallmachineslots",
//   auth,
//   asyncHandler(async (req, res, next) => {
//     const query = {
//       role: req.user.role,
//     };
//     var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
//     if (cdata.addnewmachine) {
//       const query = {
//         _id: req.query.id,
//       };
//       var cdata = await machines.getDataByQueryFilterDataOne(query);
//       if (cdata.machineid) {
//         const machineid = cdata.id;
//         const data = await machineslot.getDataforRefillTable(machineid);
//         console.log(data);
//         if (data) {
//           return rc.setResponse(res, {
//             success: true,
//             msg: "Data Fetched",
//             data: data,
//           });
//         } else {
//           return rc.setResponse(res, {
//             msg: "Data not Found",
//           });
//         }
//       } else {
//         return rc.setResponse(res, {
//           msg: "Data not Found",
//         });
//       }
//     } else {
//       return rc.setResponse(res, { error: { code: 403 } });
//     }
//   })
// );

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

// router.get(
//   "/allrefillingrequest",
//   auth,
//   asyncHandler(async (req, res) => {
//     const checkpermisson = {
//       role: req.user.role,
//     };
//     const permissions = await TableModelPermission.getDataByQueryFilterDataOne(
//       checkpermisson
//     );
//     if (!permissions.listRefillingRequest) {
//       return rc.setResponse(res, {
//         success: false,
//         msg: "No permisson to find data",
//         data: {},
//       });
//     }
//     const {
//       status,
//       refillerName,
//       date,
//       warehouse,
//       refillRequestNumber,
//       machineName,
//     } = req.query;

//     const query = {};
//     if (status) {
//       query.status = status;
//     }
//     if (refillerName) {
//       query["refillerId.first_name"] = refillerName;
//     }
//     if (date) {
//       query.createdAt = date;
//     }
//     if (warehouse) {
//       query["warehouse.wareHouseName"] = warehouse;
//     }
//     if (refillRequestNumber) {
//       query.refillRequestNumber = refillRequestNumber;
//     }
//     if (machineName) {
//       query["machineId.machinename"] = machineName;
//     }
//     try {
//       const allRefillerRequest = await refillerrequest
//         .find(query)
//         .select(
//           "id refillerId warehouse refillRequestNumber machineId status createdAt"
//         )
//         .populate("refillerId", "_id first_name user_id")
//         .populate("machineId", "machineid _id machinename")
//         .populate("warehouse", "_id wareHouseName")
//         .lean();
//       // console.log('allRefillerRequest: ', allRefillerRequest);

//       const data = allRefillerRequest.map((request) => ({
//         _id: request._id,
//         refillerId: request.refillerId._id,
//         refillerName: request.refillerId.first_name,
//         refillerUserId: request.refillerId.user_id,
//         refillingRequestNumber: request.refillRequestNumber,
//         warehouseid: request.warehouse._id,
//         warehouseName: request.warehouse.wareHouseName,
//         machine: request.machineId.machineid,
//         machineId: request.machineId._id,
//         machineName: request.machineId.machinename,
//         status: request.status,
//         date: request.createdAt,
//       }));

//       return rc.setResponse(res, {
//         success: true,
//         msg: "Data fetched",
//         data: data,
//       });
//     } catch (error) {
//       console.error("Error:", error);
//       return rc.setResponse(res, {
//         success: false,
//         msg: "An error occurred while fetching data.",
//       });
//     }
//   })
// );
router.get(
  '/allrefillingrequest',
  auth,
  asyncHandler(async (req, res) => {
    const checkPermission = {
      role: req.user.role,
    };
    // permissions to check if this user has permission to view this data or not
    const permissions = await TableModelPermission.getDataByQueryFilterDataOne(checkPermission);

    if (!permissions.listRefillingRequest) {
      return rc.setResponse(res, {
        success: false,
        msg: 'No permission to find data',
        data: {},
      });
    }
    const {
      status,
      refillerName,
      date,
      warehouse,
      refillRequestNumber,
      machineName,
    } = req.query;

    const query = {};
    // query created for filtering 
    const query2 = {};
    // query2 created beacuse if refiller login it should only see his approved request or else if superadmin or admin then they should be able to see all approved request
    if(req.user.role == "Refiller"){
      query2.refillerId = req.user._id;
      console.log(query2);
    }
    if (status) {
      query.status = status;
    }
    if (refillerName) {
      query['refillerId.first_name'] = { $regex: new RegExp(refillerName, 'i') };
    }
    if (date) {
      query.createdAt = date;
    }
    if (warehouse) {
      query['warehouse.wareHouseName'] = warehouse;
    }
    if (refillRequestNumber) {
      query.refillRequestNumber = refillRequestNumber;
    }
    if (machineName) {
      query['machineId.machinename'] = machineName;
    }
    const mergedQuery = Object.assign({}, query, query2);
    try {
      const allRefillerRequest = await refillerrequest
      .find(mergedQuery)
      .select('id refillerId warehouse refillRequestNumber machineId status createdAt')
      .populate('refillerId', '_id first_name user_id')
      .populate('machineId', 'machineid _id machinename')
      .populate('warehouse', '_id wareHouseName')
      .lean();
      
      // console.log('allRefillerRequest: ', allRefillerRequest);

      const data = allRefillerRequest.map((request) => ({
        _id: request._id,
        refillerId: request.refillerId._id,
        refillerName: request.refillerId.first_name,
        refillerUserId: request.refillerId.user_id,
        refillingRequestNumber: request.refillRequestNumber,
        warehouseid: request.warehouse._id,
        warehouseName: request.warehouse.wareHouseName,
        machine: request.machineId.machineid,
        machineId: request.machineId._id,
        machineName: request.machineId.machinename,
        status: request.status,
        date: request.createdAt,
      }));

      return rc.setResponse(res, {
        success: true,
        msg: 'Data fetched',
        data: data,
      });
    } catch (error) {
      console.error('Error:', error);
      return rc.setResponse(res, {
        success: false,
        msg: 'An error occurred while fetching data.',
      });
    }
  })
);

//------------------refilling request by id--------------------------------//

router.get(
  "/refillRequest/:id",
  auth,
  asyncHandler(async (req, res) => {
    const checkpermisson = {
      role: req.user.role,
    };
    const permissions = await TableModelPermission.getDataByQueryFilterDataOne(
      checkpermisson
    );
    if (!permissions.listRefillingRequest) {
      return rc.setResponse(res, {
        success: false,
        msg: "No permisson to find data",
        data: {},
      });
    }
    const refillerRequestById = await refillerrequest
      .findOne({ _id: req.params.id })
      .populate("refillerId", ["_id", "first_name", "user_id"])
      .populate("machineId", ["machineid", "machinename", "location"])
      .populate("machineSlots.productid", [
        "_id",
        "productname",
        "sellingprice",
      ])
      .populate("returnItems.productid", [
        "_id",
        "productname",
        "sellingprice",
      ]);
    const data = refillerRequestById;
    return rc.setResponse(res, {
      success: true,
      msg: "Data fetched",
      data: data,
    });
  })
);

//------------------for approveadmin request-------------------------//
router.post(
  "/approverefillrequest/:refillRequestNumber",
  auth,
  asyncHandler(
    async (req, res) => {
      const pararms = req.params;
      // console.log("pararms: ", pararms);
      if (req.user.role === "SuperAdmin" || req.user.role === "Admin") {
        const refillRequestNumber = req.params.refillRequestNumber;
        let rdata = await refillerrequest.findOne({ refillRequestNumber });
        // console.log("rdata: ", rdata);
        // console.log(rdata.machineSlots);
        let approveddata;
        let updatedClosingStock;

        if (rdata.status === "Pending") {
          for (let i = 0; i < rdata.machineSlots.length; i++) {
            // console.log(rdata.machineSlots.length)
            let rslots = rdata.machineSlots[i].sloteid;
            // console.log(rdata.machineSlots[i].sloteid);

            const filter = { sloteid: rslots };
            const update = {
              $unset: {
                closingStock: 1,
                currentStock: 1,
                refillQuantity: 1,
                saleQuantity: 1,
                product: 1,
              },
            };
            const options = {
              upsert: false,
            };
            let data = await machineslot.updateOne(filter, update, options);
            // console.log(data);
            console.log("------------data unset--------------");

            updatedClosingStock =
              rdata.machineSlots[i].currentStock +
              rdata.machineSlots[i].refillQuantity;
            // console.log(updatedClosingStock);
            // console.log(rdata.machineSlots[i].currentStock);
            // console.log(rdata.machineSlots[i].refillQuantity);
            approveddata = await machineslot.updateOne(
              { sloteid: rdata.machineSlots[i].sloteid },
              {
                $set: {
                  closingStock: updatedClosingStock,
                  currentStock: rdata.machineSlots[i].currentStock,
                  refillQuantity: rdata.machineSlots[i].refillQuantity,
                  saleQuantity: rdata.machineSlots[i].saleQuantity,
                  product: rdata.machineSlots[i].productid,
                },
              },
              options
            );
            console.log("------------new data set------------");
          }
          // console.log(approveddata);
          if (approveddata) {
            const updaterdata = await refillerrequest.findOneAndUpdate(
              { refillRequestNumber },
              { status: "Approved" }
            );
            console.log("-----------status approved now--------------");
            // console.log("updaterdata", updaterdata);
            const checkrefillerRequest = await refillerrequest.findOne({
              refillRequestNumber,
            });
            // console.log('checkrefillerRequest: ', checkrefillerRequest);
            if (checkrefillerRequest.status === "Approved") {
              // let countSales = await machinedata.findOneAndUpdate({_id: machineId}, {cash: checkrefillerRequest.cash, totalSalesCount:checkrefillerRequest.totalSalesCount, salesValue:checkrefillerRequest.salesValue})
              for (
                let i = 0; i < checkrefillerRequest.machineSlots.length;i++) {
                const updatewarehousestock = await warehouseStock.updateOne(
                  {
                    warehouse: checkrefillerRequest.warehouse,
                    product: checkrefillerRequest.machineSlots[i].productid,
                  },
                  {
                    $inc: {
                      productQuantity:
                        -checkrefillerRequest.machineSlots[i].refillQuantity,
                    },
                  }
                );
                // console.log("updatewarehousestock", updatewarehousestock);
              }
              if (checkrefillerRequest.returnItems.length != 0) {
                for (
                  let i = 0;i < checkrefillerRequest.returnItems.length;i++) {
                  const updatewarehousestockagain =
                    await warehouseStock.updateOne(
                      {
                        warehouse: checkrefillerRequest.warehouse,
                        product: checkrefillerRequest.returnItems[i].productid,
                      },
                      {
                        $inc: {
                          productQuantity:
                            +checkrefillerRequest.returnItems[i].currentStock,
                        },
                      }
                    );
                  // console.log("updatewarehousestockagain",updatewarehousestockagain);
                }
              }
            }
            // console.log(updaterdata.machineSlots);
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
      // return res.send("done");
      return rc.setResponse(res, {
        success: true,
        msg: "data updated",
      });
    }
    // }
  )
);

// ----------------------------------------------------------------------------------//

// not using
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
  "/Machine/Slot/Table/:machineid/:page/:dataperpage",
  auth,
  asyncHandler(async (req, res, next) => {
    const page = req.params.page;
    const dataperpage = req.params.dataperpage;
    const query = {
      role: req.user.role,
    };
    var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
    if (cdata.productlist) {
      const machinedata = await machines.findOne({
        machineid: req.params.machineid,
      });
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

router.delete(
  "/deleteSlots",
  asyncHandler(async (req, res) => {
    const data = await machineslot.deleteMany({
      machineName: req.body.machineName,
    });
    return res.send("SLots deleted");
  })
);

module.exports = router;
