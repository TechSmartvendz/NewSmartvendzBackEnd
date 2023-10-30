const rc = require("./responseController");
const utils = require("../helper/apiHelper");
const { asyncHandler } = require("../middleware/asyncHandler");
const invProduct = require("../model/inv_Product");
const helper = require("../helper/uploadCSV");

const createProduct = asyncHandler(async (req, res) => {
  const pararms = req.body;
  let obj = new invProduct(pararms);
  obj.admin = req.userData._id;
  if (!obj) {
    return rc.setResponse(res, {
      success: false,
      msg: "No Data to insert",
    });
  }
  const data = await utils.saveData(invProduct, obj);
  if (data) {
    return rc.setResponse(res, {
      success: true,
      msg: "Data Inserted",
      data: data,
    });
  }
});

const getProduct = asyncHandler(async (req, res) => {
  const pararms = req.body;

  const filter = { isDeleted: false };
  const projection = {};
  const options = {};

  const data = await utils.findDocuments(
    invProduct,
    filter,
    projection,
    options
  );
  if (data)
    return rc.setResponse(res, {
      success: true,
      data: data,
    });
});

const updateProduct = asyncHandler(async (req, res) => {
  const pararms = req.body;
  console.log("pararms: ", pararms);
  let obj = {
    productId: pararms.productId,
    productType: pararms.productType,
    productName: pararms.productName,
    unit: pararms.unit,
    sellingPrice: pararms.sellingPrice,
    sellingAccount: pararms.sellingAccount,
    salesDescription: pararms.salesDescription,
    costPrice: pararms.costPrice,
    account: pararms.account,
    purchaseDescription: pararms.purchaseDescription,
    preferredVendor: pararms.preferredVendor,
    tax: pararms.tax,
    updatedBy: req.userData._id,
  };
  const data = await utils.updateData(invProduct, { _id: req.query.id }, obj);
  console.log("data: ", data);
  if (data) {
    return rc.setResponse(res, {
      success: true,
      data: "data updated",
    });
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  let obj = {
    isDeleted: true,
  };
  const data = await utils.updateData(invProduct, { _id: req.query.id }, obj);
  if (data) {
    return rc.setResponse(res, {
      success: true,
      data: "Data Deleted",
    });
  }
});

// needs to check if this is working properly or not
const bulkupload = asyncHandler(async (req, res) => {
  const validateRow = (data) => {
    if (
      data.machineid === "" ||
      data.machineid === "NA" ||
      data.machineid === "#N/A"
    ) {
      return "MachineId is missing";
    } else if (
      data.machinename === "" ||
      data.machinename === "NA" ||
      data.machinename === "#N/A"
    ) {
      return "Machinename is missing";
    } // Add more validation checks if needed

    return null;
  };

  const processRow = async (data) => {
    // Process the row, create or update data
    // Your specific logic for processing each row here
    // For example, you can insert the data into a database
    console.log("Processing row:", data);
    // Your specific logic here, e.g., save to the database
  };

  try {
    const { results, rejectData } = await performBulkUpload(
      `public/${req.file.filename}`,
      validateRow,
      processRow
    );

    if (rejectData.length > 0) {
      return res.json({
        success: true,
        msg: "Data Fetched",
        data: {
          dataupload: "partial upload",
          reject_data: rejectData,
          stored_data: results.length,
        },
      });
    } else {
      return res.json({
        success: true,
        msg: "Data Fetched",
        data: { dataupload: "success", stored_data: results.length },
      });
    }
  } catch (error) {
    // Handle errors
    console.error(error);
    return res.json({ error: { code: 500 } });
  }
});

const sampletest = asyncHandler(async (req, res) => {
  const schema = {
    productId: "",
    productType: "",
    productName: "",
    unit: "",
    sellingPrice: "",
    sellingAccount: "",
    salesDescription: "",
    costPrice: "",
    account: "",
    purchaseDescription: "",
    preferredVendor: "",
    tax: "",
    createdDate: "",
  };
  const fields = Object.keys(schema);
  helper.downloadSampleCSV(res, schema, fields);
});

module.exports = {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  bulkupload,
  sampletest,
};
