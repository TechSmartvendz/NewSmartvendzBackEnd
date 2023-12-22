const rc = require("./responseController");
const utils = require("../helper/apiHelper");
const { asyncHandler } = require("../middleware/asyncHandler");
const inv_Tax = require("../model/inv_Tax");

const addTax = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const existingtax = await inv_Tax.findOne({ $or: [{ hsn_Code: code }, { code }] });
  if (existingtax ) {
    return res.send("Already created");
  }
  let newTax = new inv_Tax(req.body);
  newTax.admin = req.userData._id;
  // change this after adding auth in routes
  // newTax.admin = "121212";
  if (!newTax) {
    return rc.setResponse(res, {
      msg: "No Data to insert",
    });
  }
  const data = await utils.saveData(inv_Tax, newTax);
  if (data) {
    return rc.setResponse(res, {
      success: true,
      msg: "Data Inserted",
      data: data,
    });
  }
});

const getTax = asyncHandler(async (req, res) => {
  //   const data = await utils.findDocuments()

  const filter = { isDeleted: false };
  const projection = {};
  const options = {};

  const data = await utils.getData(inv_Tax, filter, projection, options);

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

const getTaxById = asyncHandler(async (req, res) => {
  //   const data = await utils.findDocuments()

  const filter = { _id: req.query.id, isDeleted: false };
  const projection = {};
  const options = {};

  const data = await utils.getData(inv_Tax, filter, projection, options);

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

const updateTax = asyncHandler(async (req, res) => {
  const obj = req.body;
  const data = await utils.updateData(inv_Tax, { _id: req.query.id }, obj);
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

const deleteTax = asyncHandler(async (req, res) => {
  let obj = {
    isDeleted: true,
  };
  const data = await utils.updateData(inv_Tax, { _id: req.query.id }, obj);
  if (data) {
    return rc.setResponse(res, {
      success: true,
      data: "Data Deleted",
    });
  }
});

module.exports = { addTax, getTax, getTaxById, updateTax, deleteTax };
