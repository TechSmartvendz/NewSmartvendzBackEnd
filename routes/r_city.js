const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const TableModel = require('../model/m_city');
const TableModelState = require('../model/m_state');
const TableModelArea = require('../model/m_area');
const rc = require('../controllers/responseController');
const { asyncHandler } = require('../middleware/asyncHandler');
const auth = require('../middleware/auth');


router.post('/', auth, asyncHandler(
    async (req, res) => {
        if (req.user.role === "SuperAdmin") {
           const query={
            state:req.body.state
           }
            var cdata = await TableModelState.getDataByQueryFilterDataOne(query);
            if (cdata) {
                 newRow = new TableModel(req.body);
                 newRow.admin=req.user._id
                 newRow.state=cdata.id
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
            return rc.setResponse(res, { error: "State Not Exist" });
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
        if (req.user.role === "SuperAdmin") {
        const query={
            state:req.body.state
           }
            var cdata = await TableModelState.getDataByQueryFilterDataOne(query);
            if (cdata) {
                newData.state=cdata.id
                newData.last_update= Date.now()
        const query={_id:req.params.id}
       
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
        return rc.setResponse(res, { error: "State Not Exist" });
    } 
} else {
    return rc.setResponse(res, { error: { code: 403 } });
} 
    }
));
router.delete('/:id', auth, asyncHandler( //FIXME:need to change country if required
    async (req, res, next) => {
        const admin=req.user.id
        const id = req.params.id;
        query={city:req.params.id}
        if (req.user.role === "SuperAdmin") {
        const count = await TableModelArea.getDataCountByQuery(query); 
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
                msg: "Can't Delete this City It has Area Data"
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

router.get('/:country', auth, asyncHandler( 
    async (req, res, next) => {
        let query={
            country:req.params.country,
        }
        const data = await TableModel.getDataByQueryFilterData(query);
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