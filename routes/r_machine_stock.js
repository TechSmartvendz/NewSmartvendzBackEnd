const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const rc = require("../controllers/responseController");

const machineslot = require("../model/m_machine_slot");
const machines = require("../model/m_machine");
const refillerrequest = require("../model/m_refiller_request");
const user_infos = require("../model/m_user_info");

//------------------------removed auth for now---------------------------------//

router.get("/getallmachines", asyncHandler(async (req, res) => {
  const allmachine = await machines.find().select("machineid companyid");
  // console.log(allmachine);
  return rc.setResponse(res, {
    success: true,
    msg: "Data fetched",
    data: allmachine,
  });
}));

//------------------------get all slot details by machine Name------------------//
//------------------------removed auth for now ---------------------------------//
router.get("/getallmachineslots", asyncHandler(async (req, res) => {
  const pararms = req.query;
  const data = await machineslot.find({ machineName: pararms.machineName });
  // console.log(data);
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
}));

//-------------------------Refiller post request--------------------------------//

router.post(
  "/refillerrequest",
  auth,
  asyncHandler(async (req, res) => {
    const pararms = req.body;
    // console.log(pararms);
    if (req.user.role === "Refiller") {
      let newRequest = new refillerrequest(pararms);
      newRequest.refillerID = req.user.id;
      if (!newRequest) {
        return rc.setResponse(res, {
          msg: "No Data to insert",
        });
      }
      // console.log(pararms.machineSlot.length)
      if (!newRequest.refillerID) {
        return res.send({ message: "refiller ID is required" });
      }

      let machineSlott = [];
      let newdata;

      for (let i = 0; i < pararms.machineSlot.length; i++) {
        newdata = {
          slot: pararms.machineSlot[i].slot,
          closingStock: pararms.machineSlot[i].closingStock,
          currentStock: pararms.machineSlot[i].currentStock,
          refillQuantity: pararms.machineSlot[i].refillQuantity,
          saleQuantity: pararms.machineSlot[i].saleQuantity,
          materialName: pararms.machineSlot[i].materialName,
          slotid: pararms.machineSlot[i].slotid,
        };
        await machineSlott.push(newdata);
      }

      let randomNumber = Math.floor(Math.random() * 100000000000000);

      let oldmachineslots = await machineslot.find({ machineName: pararms.machineId });
      console.log(oldmachineslots)

      let data = new refillerrequest({
        refillerID: newRequest.refillerID,
        refillRequestNumber: randomNumber,
        machineId: pararms.machineId,
        machineSlot: machineSlott,
        oldmachineData: oldmachineslots
      });
      await data.save();

      if (data) {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Inserted",
          // data: data,
        });
      }
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

//-------------------all refilling request---------------------------------//

router.get("/allrefillingrequest", asyncHandler(async (req, res) => {
  const allRefillerRequest = await refillerrequest
    .find()
    .select(
      "id refillerID refillRequestNumber machineId pendingstatus isDeleted createdAt updatedAt"
    )
    .populate("refillerID", ["_id", "first_name", "user_id"]);
  // return res.send(data);
  return rc.setResponse(res, {
    success: true,
    msg: "Data fetched",
    data: allRefillerRequest,
  });
  
}));

//------------------refilling request by id--------------------------------//

router.get("/allrefillingrequestbyid", asyncHandler(async (req, res) => {
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
}));



//--------------------refilling request approval --------------------------//

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

//------------------for testing approveadmin request-------------------------//
router.post(
  "/approverefillrequest",
  auth,
  asyncHandler(async (req, res) => {
    const pararms = req.query;
    if (req.user.role === "SuperAdmin" || req.user.role === "Admin") {
      let rdata = await refillerrequest.find({
        refillRequestNumber: pararms.refillRequestNumber,
      });
      // console.log(rdata);

      let data;
      let approveddata;
      let updatedClosingStock;
      const updaterdata = await refillerrequest.findOneAndUpdate(
        { refillRequestNumber: pararms.refillRequestNumber },
        { pendingstatus: true }
      );
      console.log(updaterdata);
      if (rdata[0].pendingstatus === true) {
        for (let i = 0; i < rdata[0].machineSlot.length; i++) {
          // console.log(rdata[0].machineSlot[i].slotid)
          let rslots = rdata[0].machineSlot[i].slotid;
          // console.log(rdata[0].machineSlot[i].slotid);

          const filter = { sloteid: rslots };
          const update = {
            $unset: {
              closingStock: 1,
              currentStock: 1,
              refillQuantity: 1,
              saleQuantity: 1,
              materialName: 1,
            },
          };
          const options = {
            upsert: false,
          };
          data = await machineslot.updateOne(filter, update, options);

          updatedClosingStock =  rdata[0].machineSlot[i].currentStock + rdata[0].machineSlot[i].refillQuantity
          console.log(updatedClosingStock)
          console.log( rdata[0].machineSlot[i].currentStock)
          console.log(rdata[0].machineSlot[i].refillQuantity)
          approveddata = await machineslot.updateOne(
            { sloteid: rdata[0].machineSlot[i].slotid },
            {
              $set: {
                closingStock: updatedClosingStock,
                currentStock: rdata[0].machineSlot[i].currentStock,
                refillQuantity: rdata[0].machineSlot[i].refillQuantity,
                saleQuantity: rdata[0].machineSlot[i].saleQuantity,
                materialName: rdata[0].machineSlot[i].materialName,
              },
            },
            options
          );
        }
        
        if(approveddata){
        return rc.setResponse(res, {
            success: true,
            msg: "data updated",
          });
        }
      } 
      else {
        return rc.setResponse(res, {
          success: false,
          msg: "not approved",
        });
      }
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }

    // return res.send("done");
  })
);

module.exports = router;
