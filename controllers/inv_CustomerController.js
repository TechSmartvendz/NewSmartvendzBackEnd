const rc = require("./responseController");
const utils = require("../helper/apiHelper");
const { asyncHandler } = require("../middleware/asyncHandler");
const inv_Customer = require("../model/inv_Customer");

const addCustomer = asyncHandler(async (req, res) => {
  const pararms = req.body;
  const checkData = await inv_Customer.findOne({
    $or: [
      { customerEmail: pararms.customerEmail },
      { customerPhone: pararms.customerPhone[0] },
    ],
  });
  // console.log('checkData: ', checkData);
  if (checkData) {
    return rc.setResponse(res, {
      msg: `Already created with this customer ${pararms.customerName} or with customer phone - ${pararms.customerPhone}`,
    });
  }
  let newCustomer = new inv_Customer(pararms);
  newCustomer.admin = req.userData._id;
  // newCustomer.admin = "121212";
  if (!newCustomer) {
    return rc.setResponse(res, {
      msg: "No Data to insert",
    });
  }
  const data = await utils.saveData(inv_Customer, newCustomer);
  if (data) {
    return rc.setResponse(res, {
      success: true,
      msg: "Data Inserted",
      data: data,
    });
  }
});

const getCustomer = asyncHandler(async (req, res) => {
  const filter = { isDeleted: false };
  const projection = {};
  const options = {};

  const data = await utils.getData(inv_Customer, filter, projection, options);

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

const getCustomerById = asyncHandler(async (req, res) => {
  const filter = { _id: req.query.id, isDeleted: false };
  const projection = {};
  const options = {};

  const data = await utils.getData(inv_Customer, filter, projection, options);

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

const updateCustomer = asyncHandler(async (req, res) => {
  const pararms = req.body;
  const data = await utils.updateData(
    inv_Customer,
    { _id: req.query.id },
    pararms
  );
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

const deleteCustomer = asyncHandler(async (req, res) => {
  let pararms = {
    isDeleted: true,
  };
  const data = await utils.updateData(
    inv_Customer,
    { _id: req.query.id },
    pararms
  );
  if (data) {
    return rc.setResponse(res, {
      success: true,
      data: "Data Deleted",
    });
  }
});

module.exports = {
  addCustomer,
  getCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
