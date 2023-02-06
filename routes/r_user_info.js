const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const TableModel = require('../model/m_user_info');
const rc = require('./../controllers/responseController');
const { asyncHandler } = require('../middleware/asyncHandler');

const auth = require('../middleware/auth');



router.post('/SuperAdminRegistration', asyncHandler(
    async (req, res) => {
        if (req.body.role === "SuperAdmin") {
            if (req.body.password === req.body.cpassword) {
                const hashpassword = await bcrypt.hash(req.body.password, 10);
                let newRow = new TableModel(req.body);
                newRow.password = hashpassword
                if (!newRow) {
                    return rc.setResponse(res, {
                        msg: 'No Data to insert'
                    });
                }
                const token = await newRow.generateAuthToken();
                const data = await TableModel.addRow(newRow);
                if (data) {
                    //FIXME:make email send on user created/
                    // email.registerNotification(registered, req.body.password);
                    return rc.setResponse(res, {
                        success: true,
                        msg: 'Data Inserted',
                        data: newRow.token
                    });
                }
            } else {
                return rc.setResponse(res, {
                    error: "Password and Confirm Password Not Matched"
                });
            }
        } else {
            return rc.setResponse(res, { error: { code: 403 } });
        }
    }
)
);

router.post('/', auth, asyncHandler(
    async (req, res) => {
        if (req.user.role === "SuperAdmin") {
            if (req.body.password === req.body.cpassword) {
                const hashpassword = await bcrypt.hash(req.body.password, 10);
                let newRow = new TableModel(req.body);
                newRow.password = hashpassword
                newRow.admin=req.user.id
                if (!newRow) {
                    return rc.setResponse(res, {
                        msg: 'No Data to insert'
                    });
                }
                const token = await newRow.generateAuthToken();
                const data = await TableModel.addRow(newRow);
                if (data) {
                    //FIXME:make email send on user created/
                    // email.registerNotification(registered, req.body.password);
                    return rc.setResponse(res, {
                        success: true,
                        msg: 'Data Inserted',
                        data: newRow.token
                    });
                }
            } else {
                return rc.setResponse(res, {
                    error: "Password and Confirm Password Not Matched"
                });
            }
        } else {
            return rc.setResponse(res, { error: { code: 403 } });
        }
    }
)
);

router.get('/',auth, asyncHandler(
    async (req, res, next) => {
       const admin=req.user.id
        const data = await TableModel.getAllData(admin);
        // console.log("🚀 ~ file: r_user_info.js:129 ~ user", user)
        if (data) {
            return rc.setResponse(res, {
                success: true,
                msg: 'Data Fetched',
                data: data
            });
        } else {
            return rc.setResponse(res, {
                msg: "Data not Found"
            })
        }
    }
));

router.get('/:id', auth, asyncHandler( 
    async (req, res, next) => {
        const admin=req.user.id
        const id = req.params.id;
        const data = await TableModel.getDataByIdFilterData(id,admin);
        if (data) {
            return rc.setResponse(res, {
                success: true,
                msg: 'Data Fetched',
                data: data
            });
        } else {
            return rc.setResponse(res, {
                msg: "Data not Found"
            })
        }
    }
));
router.put('/:id', auth, asyncHandler( 
    async (req, res, next) => {
        const newData=req.body
        const admin=req.user.id
        const id = req.params.id;
        const count = await TableModel.getDataCount(id,admin);
        if(count){
            const data = await TableModel.updateById(id,newData,admin);
            if (data) {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: data
                });
            } else {
                return rc.setResponse(res, {
                    msg: "Data not Found"
                })
            }
        }else{
            return rc.setResponse(res, {
                msg: "Data not Found OR Permission Denied"
            })
        }
       
    }
));

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/byField',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const fieldName = req.body.fieldName;
        const fieldValue = req.body.fieldValue;
        TableModel.getDataByFieldName(fieldName, fieldValue, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: docs
                });
            }
        })
    }
);

router.post('/byFields',
    //  passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const fieldNames = req.body.fieldNames;
        const fieldValues = req.body.fieldValues;
        TableModel.getDataByFieldNames(fieldNames, fieldValues, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: docs
                });
            }
        })
    }
);

router.put('/update/:id',
    //  passport.authenticate("jwt", { session: false }),
    (req, res) => {
        TableModel.updateRow(req.params.id, req.body, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Updated',
                    data: docs
                });
            }
        })
    }
);

router.delete('/byId/:id',
    //  passport.authenticate("jwt", { session: false }),
    (req, res) => {
        TableModel.deleteTableById(req.params.id, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Deleted',
                    data: docs
                });
            }
        })
    }
);

/**
 * custom functions
 */

// function for updating data via user_id

router.put('/updateViaUserID/:id',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {

        console.log(req.body);
        TableModel.updateViaUser_idRow(req.params.id, req.body, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Updated',
                    data: docs
                });
            }
        })
    }
);

module.exports = router;