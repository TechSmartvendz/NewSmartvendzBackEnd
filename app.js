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

//TODO:Applying Routes As A Middleware
app.use("/", indexRouter);
app.use("/api/User", userInformation);

//TODO:catch 404 and forward to error handler
app.use(function (req, res, next) {
   // next(createError(404));
   return rc.setResponse(res, {
    msg: "API not Found:404"
})
  });


app.listen(port, () => { console.log(`connection is setup at ${port}`); })
