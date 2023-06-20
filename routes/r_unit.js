const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const TableModel = require('../model/m_unit');
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
router.get('/',auth, asyncHandler( //getDataByQueryFilterData
    async (req, res, next) => {
    if (req.user.role === "SuperAdmin") {
       let query={}
        const data = await TableModel.getDataforTable(query);
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
router.get('/Datalist',auth, asyncHandler(//getDataListByQuery
    async (req, res, next) => {
       let query={}
        const data = await TableModel.getDataListByQuery(query);
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
router.get('/:id', auth, asyncHandler( //getDataByIdData
    async (req, res, next) => {
        const admin=req.user.id
        const id = req.params.id;
        if (req.user.role === "SuperAdmin") {
        const data = await TableModel.getDataByIdData(id);
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
router.patch('/:id', auth, asyncHandler( 
    async (req, res, next) => {
        const newData=req.body
          newData.admin=req.user.id
          newData.last_update= Date.now()
        const query={_id:req.params.id}
        if (req.user.role === "SuperAdmin") {
            const data = await TableModel.updateByQuery(query,newData);
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
router.delete('/:id', auth, asyncHandler( 
    async (req, res, next) => {
        const admin=req.user.id
        const country = req.params.id;
        // query={country:country}
        if (req.user.role === "SuperAdmin") {
        // const count = await TableModelState.getDataCountByQuery(query); 
        // if(!count){
            // console.log("🚀 ~ file: r_country.js:129 ~ count", count)
            query={_id:req.params.id}
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
            console.log("🚀 ~ file: r_country.js:129 ~ count", count)
            return rc.setResponse(res, {
                msg: "Can't Delete this Country It has State Data"
            })
        }
    // } else {
    //     return rc.setResponse(res, { error: { code: 403 } });
    // }  
       
    }
));


module.exports = router;