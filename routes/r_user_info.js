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
router.get('/DataList',auth, asyncHandler(
    async (req, res, next) => {
       const admin=req.user.id
        const data = await TableModel.getDataList(admin);
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
router.delete('/:id', auth, asyncHandler( 
    async (req, res, next) => {
        const admin=req.user.id
        const id = req.params.id;
        const count = await TableModel.getDataCount(id);
        if(!count){
            const data = await TableModel.dataDeleteById(id,admin);
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
                msg: "Can't Delete this User: Delete all the Responsiable Resources First"
            })
        }
       
    }
));


module.exports = router;