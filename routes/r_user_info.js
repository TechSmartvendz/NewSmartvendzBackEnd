const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const TableModel = require('../model/m_user_info');
const TableModelCountry = require('../model/m_country');
const TableModelState = require('../model/m_state');
const TableModelCity = require('../model/m_city');
const TableModelArea= require('../model/m_area');
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
        // console.log(req.user)
       const admin=req.user._id
       
        const data = await TableModel.getAllDataForTable(admin);
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
// router.get('/DataList',auth, asyncHandler(
//     async (req, res, next) => {
//        const admin=req.user.id
//         const data = await TableModel.getDataList(admin);
//         // console.log("🚀 ~ file: r_user_info.js:129 ~ user", user)
//         if (data) {
//             return rc.setResponse(res, {
//                 success: true,
//                 msg: 'Data Fetched',
//                 data: data
//             });
//         } else {
//             return rc.setResponse(res, {
//                 msg: "Data not Found"
//             })
//         }
//     }
// ));

router.get('/DataList', auth, asyncHandler(async(req,res)=> {
    let role = req.query.role;
    // console.log(req.query)
    if(role == "Refiller" ){
        role = "Refiller";
    }
    if(role == "SuperAdmin"){
        role = "SuperAdmin";
    }
    if(role == "Admin"){
        role = "Admin";
    }
    let filter = {};
    if(!req.query.role){
        filter = {};
    }
    else{
        filter = {role:role}
    }
    const data = await TableModel.find(filter).select("id user_id last_name first_name");
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
}));
router.get('/:id', auth, asyncHandler( 
    async (req, res, next) => {
        const admin=req.user._id
        const id = req.params.id;
        if (req.user.role === "SuperAdmin") {
        const query={
            _id:id,
            // admin:admin
        }
        const data = await TableModel.getDataByQueryFilterDataOne(query);
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
    } else {
        return rc.setResponse(res, { error: { code: 403 } });
    }
    }
));
router.put('/:id', auth, asyncHandler( 
    async (req, res) => {
        if (req.user.role === "SuperAdmin") {
            newData=req.body
            id=req.params.id
            if (req.body.password === req.body.cpassword) {
                const hashpassword = await bcrypt.hash(req.body.password, 10);
                newData.password = hashpassword
                newData.admin=req.user.id
                const data = await TableModel.updateById(id,newData);
                if (data) {
                    console.log("🚀 ~ file: r_user_info.js:156 ~ data", data)
                    //FIXME:make email send on user created/
                    // email.registerNotification(registered, req.body.password);
                    return rc.setResponse(res, {
                        success: true,
                        msg: 'Data Inserted',
                        data:data.user_id
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
));
router.delete('/:id', auth, asyncHandler( 
    async (req, res, next) => {
        if (req.user.role === "SuperAdmin") {
       const query={
        _id:req.params.id,
       }
        const count = await TableModel.getDataCount(req.params.id);
        if(!count){
            const data = await TableModel.dataDeleteByQuery(query);
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
    } else {
        return rc.setResponse(res, { error: { code: 403 } });
    }
       
    }
));


module.exports = router;