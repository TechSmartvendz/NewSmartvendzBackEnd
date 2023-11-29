const rc = require("./responseController");
const utils = require("../helper/apiHelper");
const { asyncHandler } = require("../middleware/asyncHandler");
const inv_Unit = require("../model/inv_Unit");

const addUnit = asyncHandler(async (req, res) => {
  let pararms = req.body;
  const checkData = await inv_Unit.findOne({
    unit: pararms.unit.trim(),
  });
  // console.log("checkData: ", checkData);
  if (checkData) {
    return res.send("Already created");
  }
  let newUnit = new inv_Unit(pararms);
  // newUnit.admin = req.userData._id;
  newUnit.admin = "121212";
  if (!newUnit) {
    return rc.setResponse(res, {
      msg: "No Data to insert",
    });
  }
  const data = await utils.saveData(inv_Unit, newUnit);
  if (data) {
    return rc.setResponse(res, {
      success: true,
      msg: "Data Inserted",
      data: data,
    });
  }
});

const getUnit = asyncHandler(async (req, res) => {
  const filter = { isDeleted: false };
  const projection = {};
  const options = {};

  const data = await utils.getData(inv_Unit, filter, projection, options);

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
});

const getUnitById = asyncHandler(async (req, res) => {
  const filter = { _id: req.query.id, isDeleted: false };
  const projection = {};
  const options = {};

  const data = await utils.getData(inv_Unit, filter, projection, options);

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
});

const updateUnit = asyncHandler(async (req, res) => {
  const pararms = req.body;
  const data = await utils.updateData(inv_Unit, { _id: req.query.id }, pararms);
  if (data) {
    return rc.setResponse(res, {
      success: true,
      msg: "Data updated",
      // data: data,
    });
  } else {
    return rc.setResponse(res, {
      msg: "Some error occured",
    });
  }
});

const deleteUnit = asyncHandler(async (req, res) => {
  let pararms = {
    isDeleted: true,
  };
  const data = await utils.updateData(inv_Unit, { _id: req.query.id }, pararms);
  if (data) {
    return rc.setResponse(res, {
      success: true,
      data: "Data Deleted",
    });
  }
});

module.exports = {
  addUnit,
  getUnit,
  getUnitById,
  updateUnit,
  deleteUnit,
};
