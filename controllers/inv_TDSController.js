const rc = require("./responseController");
const utils = require("../helper/apiHelper");
const { asyncHandler } = require("../middleware/asyncHandler");
const inv_TDS = require("../model/inv_TDS");
const inv_TdsSection = require("../model/inv_tdsTaxSection");

const addTDS = asyncHandler(async (req, res) => {
  let pararms = req.body;
  const checkData = await inv_TDS.findOne({
    tdsName: pararms.tdsName.trim(),
  });
  // console.log("checkData: ", checkData);
  if (checkData) {
    return res.send("Already created");
  }
  let newTDS = new inv_TDS(pararms);
  // newTDS.admin = req.userData._id;
  newTDS.admin = "121212";
  if (!newTDS) {
    return rc.setResponse(res, {
      msg: "No Data to insert",
    });
  }
  const data = await utils.saveData(inv_TDS, newTDS);
  if (data) {
    return rc.setResponse(res, {
      success: true,
      msg: "Data Inserted",
      data: data,
    });
  }
});

const getTDS = asyncHandler(async (req, res) => {
  //   const data = await utils.findDocuments()

  const filter = { isDeleted: false };
  const projection = {};
  const options = {};

  const data = await utils.getData(inv_TDS, filter, projection, options);

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

const getTDSById = asyncHandler(async (req, res) => {
  //   const data = await utils.findDocuments()

  const filter = { _id: req.query.id, isDeleted: false };
  const projection = {};
  const options = {};

  const data = await utils.getData(inv_TDS, filter, projection, options);

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

const updateTDS = asyncHandler(async (req, res) => {
  const pararms = req.body;
  const data = await utils.updateData(inv_TDS, { _id: req.query.id }, pararms);
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

const deleteTDS = asyncHandler(async (req, res) => {
  let pararms = {
    isDeleted: true,
  };
  const data = await utils.updateData(inv_TDS, { _id: req.query.id }, pararms);
  if (data) {
    return rc.setResponse(res, {
      success: true,
      data: "Data Deleted",
    });
  }
});

// this is TDS section

const addTdsSection = asyncHandler(async (req, res) => {
  let pararms = req.body;
  const checkData = await inv_TdsSection.findOne({
    section: pararms.section.trim(),
  });
  // console.log("checkData: ", checkData);
  if (checkData) {
    return res.send("Already created");
  }
  let newTdsSection = new inv_TdsSection(pararms);
  // newTdsSection.admin = req.userData._id;
  newTdsSection.admin = "121212";
  if (!newTdsSection) {
    return rc.setResponse(res, {
      msg: "No Data to insert",
    });
  }
  const data = await utils.saveData(inv_TdsSection, newTdsSection);
  if (data) {
    return rc.setResponse(res, {
      success: true,
      msg: "Data Inserted",
      data: data,
    });
  }
});

const getTdsSection = asyncHandler(async (req, res) => {
  const filter = { isDeleted: false };
  const projection = {};
  const options = {};
  const data = await utils.getData(
    inv_TdsSection,
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

const getTdsSectionById = asyncHandler(async (req, res) => {
  const filter = { _id: req.query.id, isDeleted: false };
  const projection = {};
  const options = {};

  const data = await utils.getData(
    inv_TdsSection,
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

const updateTdsSection = asyncHandler(async (req, res) => {
  const pararms = req.body;
  const data = await utils.updateData(
    inv_TdsSection,
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

const deleteTdsSection = asyncHandler(async (req, res) => {
  let pararms = {
    isDeleted: true,
  };
  const data = await utils.updateData(
    inv_TdsSection,
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
  addTDS,
  getTDS,
  getTDSById,
  updateTDS,
  deleteTDS,
  addTdsSection,
  getTdsSection,
  getTdsSectionById,
  updateTdsSection,
  deleteTdsSection,
};
