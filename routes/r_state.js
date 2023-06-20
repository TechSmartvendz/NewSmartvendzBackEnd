const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const TableModelCountry = require('../model/m_country');
const TableModel = require('../model/m_state');
const TableModelCity = require('../model/m_city');
const rc = require('../controllers/responseController');
const { asyncHandler } = require('../middleware/asyncHandler');
const auth = require('../middleware/auth');


router.post('/', auth, asyncHandler(
    async (req, res) => {
        if (req.user.role === "SuperAdmin") {
           const query={
            country:req.body.country
           }
            var cdata = await TableModelCountry.getDataByQueryFilterDataOne(query);
            if (cdata) {
                 newRow = new TableModel(req.body);
                  newRow.admin=req.user._id
                newRow.country=cdata.id
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
            return rc.setResponse(res, { error: "Country Not Exist" });
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
        const data = await TableModel.getDataforTable(admin);
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
        newData.admin=req.user.id
        const query={
            country:req.body.country
           }
            var cdata = await TableModelCountry.getDataByQueryFilterDataOne(query);
            if (cdata) {
                newData.country=cdata.id
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
    } else {
        return rc.setResponse(res, { error: "Country Not Exist" });
    } 
    }
));
router.delete('/:id', auth, asyncHandler( //FIXME:need to change country if required
    async (req, res, next) => {
        const admin=req.user.id
        const id = req.params.id;
        query={state:req.params.id}
        if (req.user.role === "SuperAdmin") {
        const count = await TableModelCity.getDataCountByQuery(query); 
        if(!count){
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
            return rc.setResponse(res, {
                msg: "Can't Delete this State It has City Data"
            })
        }
    } else {
        return rc.setResponse(res, { error: { code: 403 } });
    }  
       
    }
));
//FIXME:Not Using right now
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



module.exports = router;