require("dotenv").config();
var express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
var path = require("path");
const logger = require("./logger/logger");
require("./config/dbconn");
const port = process.env.PORT || 80;
var app = express();
const rc = require("./controllers/responseController");

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin",
    "X-Requested-With,content-type",
    "Accept",
    "Authorization"
  );
  next();
});

//TODO: import Routers
const indexRouter = require("./routes/index");
const userInformation = require("./routes/r_user_info");
const Country = require("./routes/r_country");
const State = require("./routes/r_state");
const City = require("./routes/r_city");
const Area = require("./routes/r_area");
const Unit = require("./routes/r_unit");
const Permission = require("./routes/r_permission");
const Company = require("./routes/r_company");
const Machine = require("./routes/r_machine");
const Product = require("./routes/r_product");
const Employee = require("./routes/r_employee");
const Logic = require("./routes/r_logic");

const machine_Stock = require("./routes/r_machine_stock");
const warehouse = require("./routes/r_warehouse");
const supplier = require("./routes/r_suppllier");
const warestocktransferrequest = require("./routes/r_warehouseStockTransferRequest");
const gst = require("./routes/r_gst");
const refillerRequest = require("./routes/r_refillerRequest");

// invoice Models

const invUser = require("./routes/invUser");
const invProduct = require("./routes/invProduct");
const invTax = require("./routes/invTax");
const invPaymentTerm = require("./routes/invPaymentTerm");
const invInvoice = require("./routes/invInvoice");
const invCustomer = require("./routes/invCustomer");
const invUnit = require("./routes/invUnit");
const invTDS = require("./routes/invTDS");
const devicesMachinesRoutes = require("./routes/devicesMachinesRoutes");
const snaxSmartRoute = require("./routes/snaxSmartAPI") 

//TODO:Applying Routes As A Middleware
app.use("/", indexRouter);
app.use("/api/User", userInformation);
app.use("/api/Country", Country);
app.use("/api/State", State);
app.use("/api/City", City);
app.use("/api/Area", Area);
app.use("/api/Unit", Unit);
app.use("/api/Permission", Permission);
app.use("/api/Company", Company);
app.use("/api/Machine", Machine);
app.use("/api/Product", Product);
app.use("/api/Employee", Employee);
app.use("/api/Logic", Logic);

app.use("/api", machine_Stock);
app.use("/api", warehouse);
app.use("/api", supplier);
app.use("/api", warestocktransferrequest);
app.use("/api/tax", gst);
app.use("/api", refillerRequest);

// Invoice Routes

app.use("/api/invUser", invUser);
app.use("/api/invProduct", invProduct);
app.use("/api/invTax", invTax);
app.use("/api/invPaymentTerm", invPaymentTerm);
app.use("/api/invInvoice", invInvoice);
app.use("/api/invCustomer", invCustomer);
app.use("/api/invUnit", invUnit);
app.use("/api/invTDS", invTDS);
app.use('/api/mappings', devicesMachinesRoutes);
app.use('/api/snaxsmart', snaxSmartRoute);

//TODO:catch 404 and forward to error handler
app.use((req, res, next) => {
  // next(createError(404));
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  rc.setResponse(res, {
    msg: "API not Found:404",
  });
  next();
});

// logger.info('This is an info message');
// logger.error('This is an error message');

app.listen(port, () => {
  console.log(`connection is setup at ${port}`);
});
