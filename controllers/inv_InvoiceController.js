const rc = require("./responseController");
const utils = require("../helper/apiHelper");
const { asyncHandler } = require("../middleware/asyncHandler");
const inv_Invoice = require("../model/inv_Invoice");
const inv_Payment = require("../model/inv_Payment");

const addInvoice = asyncHandler(async (req, res) => {
  const pararms = req.body;
  const checkData = await inv_Invoice.findOne({
    invoiceNumber: pararms.invoiceNumber,
    branch: pararms.branch
  });
  if (checkData) {
    return rc.setResponse(res, {
      msg: `Already created with this invoice ${pararms.invoiceNumber} at ${pararms.branch} `,
    });
  }
  let newInvoice = new inv_Invoice(pararms);
  // newInvoice.admin = req.userData._id;
  newInvoice.admin = "121212";
  if (!newInvoice) {
    return rc.setResponse(res, {
      msg: "No Data to insert",
    });
  }
  const invoiceData = await utils.saveData(inv_Invoice, newInvoice);
  // console.log("invoiceData: ", invoiceData);

  if (invoiceData) {
    let newPayment = {
      customerId: pararms.customerId,
      invoiceId: invoiceData._id,
      status: "Unpaid",
      createdDate: pararms.createdDate,
      // admin: req.userData._id,
      admin: "12121212",
    };

    const paymentData = await utils.saveData(inv_Payment, newPayment);

    if (paymentData) {
      return rc.setResponse(res, {
        success: true,
        msg: "Data Inserted",
        data: invoiceData,
      });
    } else {
      return rc.setResponse(res, {
        msg: "Failed to create payment record",
      });
    }
  } else {
    return rc.setResponse(res, {
      msg: "Failed to create invoice",
    });
  }
});

const getInvoice = asyncHandler(async (req, res) => {
  const filter = { isDeleted: false };
  const projection = {};
  const options = {};

  const data = await utils.getData(
    inv_Invoice,
    filter,
    projection,
    options
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
});

const getInvoiceById = asyncHandler(async (req, res) => {
  const filter = { _id: req.query.id, isDeleted: false };
  const projection = {};
  const options = {};

  const data = await utils.getData(
    inv_Invoice,
    filter,
    projection,
    options
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
});

const updateInvoice = asyncHandler(async (req, res) => {
  const pararms = req.body;
  const data = await utils.updateData(
    inv_Invoice,
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

const deleteInvoice = asyncHandler(async (req, res) => {
  let pararms = {
    isDeleted: true,
  };
  const data = await utils.updateData(
    inv_Invoice,
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

const nextInvoiceNumber = asyncHandler(async (req, res) => {
  console.log(req.query)
  const filter = {branch: req.query.branch}
  const data = await inv_Invoice
    .findOne(filter)
    .sort({ invoiceNumber: -1 })
    .select("invoice invoiceNumber");

    if(!data){
      return rc.setResponse(res, {
        success: false,
        msg:"Invoice with this branch is never created"
      })
    }
  const currentOrderNumber = parseInt(data.invoiceNumber, 10);
  const nextOrderNumber = (currentOrderNumber + 1).toString().padStart(5, "0");
  data.invoiceNumber = nextOrderNumber;
  const nextData = {
    invoice: "INV-",
    invoiceNumber: nextOrderNumber,
  };
  console.log('nextData: ', nextData);
  return rc.setResponse(res, {
    success: true,
    data: nextData,
  });
});

module.exports = {
  addInvoice,
  getInvoice,
  getInvoiceById,
  updateInvoice,
  nextInvoiceNumber,
};
