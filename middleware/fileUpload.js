const multer = require("multer");
const csv = require('csv-parser')
const fs = require('fs')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public")
    },
    limits: {
        files: 1
    },
    filename: function (req, file, cb) {
        const parts = file.mimetype.split("/");
        // cb(null,`${file.fieldname}-${Date.now()}.${parts[1]}`)
        cb(null, `${file.fieldname}-${Date.now()}.csv`)
    },
    onFileUploadStart: function (file) {
        // console.log("Inside uploads");
        if (file.mimetype == 'text/csv') {
            return true;
        }
        else {
            return false;
        }
    }
})
module.exports.upload = multer({ storage });
