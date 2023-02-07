const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const TableModel = require('../model/m_country');
const rc = require('../controllers/responseController');
const { asyncHandler } = require('../middleware/asyncHandler');
const auth = require('../middleware/auth');




router.post('/', auth, asyncHandler(
    async (req, res) => {
        if (req.user.role === "SuperAdmin") {
                let newRow = new TableModel(req.body);
                newRow.admin=req.user.id
                if (!newRow) {
                    return rc.setResponse(res, {
                        msg: 'No Data to insert'
                    });
                }
                const data = await TableModel.addRow(newRow);
                if (data) {
                    return rc.setResponse(res, {
                        success: true,
                        msg: 'Data Inserted',
                        data: data
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
router.patch('/:id', auth, asyncHandler( 
    async (req, res, next) => {
        const newData=req.body
        const admin=req.user.id
        const id = req.params.id;
       
            const data = await TableModel.updateById(id,admin,newData);
            console.log("🚀 ~ file: r_country.js:97 ~ data", data)
            if (data) {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: data
                });
            } else {
                return rc.setResponse(res, {
                    msg: "Data not Found OR Permission Denied"
                })
            }
       
       
    }
));
router.delete('/:country', auth, asyncHandler( //FIXME:need to change country if required
    async (req, res, next) => {
        const admin=req.user.id
        const country = req.params.country;
        //FIXME:need to modify to check it is using in state table 
        // const count = await TableModel.getDataCount(id); 
        // if(!count){
            const data = await TableModel.dataDeleteById(country,admin);
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
        // }else{
        //     return rc.setResponse(res, {
        //         msg: "Can't Delete this User: Delete all the Responsiable Resources First"
        //     })
        // }
       
    }
));


module.exports = router;