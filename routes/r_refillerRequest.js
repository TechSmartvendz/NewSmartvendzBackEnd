const express = require("express");
const router = express.Router();

const rc = require("../controllers/responseController");
const { asyncHandler } = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");
const TableModelPermission = require("../model/m_permission");

const refillRequest = require("../model/m_refiller_request");

const machinedata = require("../model/m_machine");
const machineslot = require("../model/m_machine_slot");

const user_infos = require("../model/m_user_info");
const warehouseTable = require("../model/m_warehouse");
const warehouseStock = require("../model/m_warehouse_Stock");

// ------------- New refiller request------------------

router.post(
  "/refill/request",
  auth,
  asyncHandler(async (req, res) => {
    try {
      if (req.user.role == "Refiller" || req.user.role == "SuperAdmin") {
        // console.log('req.body: ', req.body);
        // console.log("req.body",req.body.machineSlot);
        // console.log("returnitems:",req.body.returnItems);

        const { machineId, machineSlot, date, sales } = req.body;
        const refillerid = req.user.id;
        // console.log(refillerid);
        // Create the refill request in the database
        const warehouseid = await machinedata.findOne({ _id: machineId });
        // console.log("deletedSlots", req.body.deletedSlots);
        // console.log("warehouseid", warehouseid);
        let updatedSlots;
        if (!req.body.returnItems) {
          updatedSlots = null;
        } else {
          updatedSlots = req.body.returnItems;
        }
        let randomNumber = Math.floor(Math.random() * 100000000000000);
        let data = new refillRequest({
          refillerId: refillerid,
          machineId: machineId,
          warehouse: warehouseid.warehouse,
          machineSlots: machineSlot,
          returnItems: updatedSlots,
          refillRequestNumber: randomNumber,
          status: "Pending",
          date: date,
          sales: sales,
        });
        // console.log("data", data);
        await data.save();
        rc.setResponse(res, {
          success: true,
          message: "Refill request sent.",
          data: data,
        });
      } else {
        return rc.setResponse(res, { error: { code: 403 } });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Failed to send refill request." });
    }
  })
);

// -------------------------------------------------------

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
    const refillerRequestById = await refillRequest
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

// -------------------------------------------------------//

// ------------Delete refillRequest by id------------------//

router.delete(
  "/refillrequest/:id",
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role == "SuperAdmin" || req.user.role == "Admin") {
      const deleteRequestId = req.params.id;
      if (!deleteRequestId) {
        return rc.setResponse(res, {
          msg: "Missing refillRequestNumber parameter",
        });
      }
      const deleteRequest = await refillRequest.findOneAndDelete({
        refillRequestNumber: deleteRequestId,
      });
      if (!deleteRequest) {
        return rc.setResponse(res, {
          msg: "Request not found",
        });
      }
      return rc.setResponse(res, {
        success: true,
        msg: "Request deleted",
      });
    } else {
      return rc.setResponse(res, { error: { code: 403 } });
    }
  })
);

// --------------------------------------------------------//

//------------------approve refilling request by id--------------------------------//
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
        let rdata = await refillRequest.findOne({ refillRequestNumber });
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
            const updaterdata = await refillRequest.findOneAndUpdate(
              { refillRequestNumber },
              { status: "Approved" }
            );
            console.log("-----------status approved now--------------");
            // console.log("updaterdata", updaterdata);
            const checkrefillerRequest = await refillRequest.findOne({
              refillRequestNumber,
            });
            // console.log('checkrefillerRequest: ', checkrefillerRequest);
            if (checkrefillerRequest.status === "Approved") {
              let countSales = await machinedata.findOneAndUpdate(
                { _id: checkrefillerRequest.machineId },
                {
                  cash: checkrefillerRequest.sales.cash,
                  totalSalesCount: checkrefillerRequest.sales.totalSalesCount,
                  totalSalesValue: checkrefillerRequest.sales.totalSalesValue,
                }
              );
              for (
                let i = 0;
                i < checkrefillerRequest.machineSlots.length;
                i++
              ) {
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
                  let i = 0;
                  i < checkrefillerRequest.returnItems.length;
                  i++
                ) {
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

// --------------------------------------------------------//
// --------------------- edit refilling request -------------//
router.put(
  "/refill/request/:id",
  auth,
  asyncHandler(async (req, res) => {
    const { id } = req.params; // Extract the ID from the URL
    const { machineId, machineSlots, date, sales, returnItems } = req.body;

    try {
      if (req.user.role === "Admin" || req.user.role === "SuperAdmin") {
        // Find the existing refill request by ID
        const existingRequest = await refillRequest.findById({_id: id});

        if (!existingRequest) {
          return res.status(404).json({ error: "Refill request not found." });
        }

        // Update the existing refill request fields
        existingRequest.machineId = machineId;
        existingRequest.machineSlots = machineSlots;
        existingRequest.date = date;
        existingRequest.sales = sales;
        existingRequest.returnItems = returnItems;

        // Save the updated refill request
        const updatedRequest = await existingRequest.save();

        rc.setResponse(res, {
          success: true,
          message: "Refill request updated.",
          data: updatedRequest,
        });
      } else {
        return rc.setResponse(res, { error: { code: 403 } });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error: "Failed to update refill request." });
    }
  })
);

// --------------------------------------------------------//

//---------------- get all refilling Request----------------//

router.get(
  "/allrefillingrequest",
  auth,
  asyncHandler(async (req, res) => {
    const checkPermission = {
      role: req.user.role,
    };
    // permissions to check if this user has permission to view this data or not
    const permissions = await TableModelPermission.getDataByQueryFilterDataOne(
      checkPermission
    );

    if (!permissions.listRefillingRequest) {
      return rc.setResponse(res, {
        success: false,
        msg: "No permission to find data",
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

    let filters = [];
    // query created for filtering
    const query2 = {};

    if (req.user.role === "Admin") {
      const machinesCreatedByAdmin = await machinedata
        .find({ admin: req.user._id })
        .select("_id");
      const machineIdsCreatedByAdmin = machinesCreatedByAdmin.map(
        (machine) => machine._id
      );
      filters.push({ machineId: { $in: machineIdsCreatedByAdmin } });
    }

    // query2 created beacuse if refiller login it should only see his approved request or else if superadmin or admin then they should be able to see all approved request
    if (req.user.role == "Refiller") {
      query2.refillerId = req.user._id;
      // console.log(query2);
    }
    if (status) {
      filters.push({ status: status });
    }
    if (refillerName) {
      const refillerdetail = await user_infos.findOne({
        first_name: refillerName,
      });
      filters.push({ refillerId: refillerdetail._id });
    }
    if (date) {
      const clientDate = new Date(date);
      const startDate = new Date(clientDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(clientDate);
      endDate.setHours(23, 59, 59, 999);
      filters.push({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      });
    }
    if (warehouse) {
      const warehousedetail = await warehouseTable.findOne({
        wareHouseName: warehouse,
      });
      filters.push({ warehouse: warehousedetail._id });
    }
    if (refillRequestNumber) {
      filters.push({ refillRequestNumber: refillRequestNumber });
    }
    if (machineName) {
      const machinedetail = await machinedata.findOne({
        machinename: machineName,
      });
      filters.push({ machineId: machinedetail._id });
    }
    const mergedQuery = { $and: [query2, ...filters] };
    try {
      const allRefillerRequest = await refillRequest
        .find(mergedQuery)
        .select(
          "id refillerId warehouse refillRequestNumber machineId status createdAt"
        )
        .populate("refillerId", "_id first_name user_id")
        .populate("machineId", "machineid _id machinename")
        .populate("warehouse", "_id wareHouseName")
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
        msg: "Data fetched",
        data: data,
      });
    } catch (error) {
      console.error("Error:", error);
      return rc.setResponse(res, {
        success: false,
        msg: "An error occurred while fetching data.",
      });
    }
  })
);
// ---------------------------------------------------------//

module.exports = router;
