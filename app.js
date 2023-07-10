require('dotenv').config();

var express = require("express");
const cookieParser = require("cookie-parser");
const CsvParser = require("json2csv").Parser;
const multer = require("multer");
const csv = require('csv-parser');
const fs = require('fs');
const cors = require('cors');
const cjs = require("crypto-js");
const mongoose =require("mongoose");
var path = require("path");

//TODO:import inital configuration and connection checks
require("./config/dbconn");
//TODO:port defination
const port = process.env.PORT || 80;

//TODO:import local modules and middlewares
const auth = require("./middleware/auth");
const rc = require('./controllers/responseController');

//TODO:setup app
var app = express();

//TODO:if it not using delete this ejs setupy
// view engine setup ejs 
// app.set("views", path.join(__dirname, "views")); 
// app.set("view engine", "ejs");

//TODO:if it not using delete this hbs setup
// view engine setup hbs 
// const staticPath = path.join(__dirname, "/src");
// console.log(staticPath);
// const templatePath = path.join(__dirname, "/templates/views");
// const partialsPath = path.join(__dirname, "/templates/partials");
// app.set('view engine', 'hbs');
// app.set("views", templatePath);
// hbs.registerPartials(partialsPath);

//TODO:if want to use morgan logger uncomment this
// app.use(logger("dev"));

//TODO: app extentions
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//TODO: API route for file upload handler multer 
// const file = require("./routes/file");
// app.use("/api/file", file);

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

app.use('/api', machine_Stock);
app.use('/api',warehouse);
app.use('/api',supplier);
app.use('/api', warestocktransferrequest);
//TODO:catch 404 and forward to error handler
app.use(function (req, res, next) {
   // next(createError(404));
   return rc.setResponse(res, {
    msg: "API not Found:404"
})
  });


app.listen(port, () => { console.log(`connection is setup at ${port}`); })
