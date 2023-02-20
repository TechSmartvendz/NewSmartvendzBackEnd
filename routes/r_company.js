const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const TableModelUser = require('../model/m_user_info');
const TableModelPermission = require('../model/m_permission');
const TableModel = require('../model/m_company');
// const TableModelCity = require('../model/m_city');
const rc = require('../controllers/responseController');
const { asyncHandler } = require('../middleware/asyncHandler');
const auth = require('../middleware/auth');



router.post('/', auth, asyncHandler(
    async (req, res) => {
        const query={
            role:req.user.role
           }
        var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
        if (cdata.addnewcompany) {
                 newRow = new TableModel(req.body);
                  newRow.admin=req.user._id
                // newRow.country=cdata.id
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
        const query={
            role:req.user.role
           }
        var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
        if (cdata.listcompany) {
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
  else {
    return rc.setResponse(res, { error: { code: 403 } });
}    
}
));
router.get('/Datalist',auth, asyncHandler(//getDataListByQuery
async (req, res, next) => {
     const query={
        admin:req.user.id
     }
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
router.get('/:id',auth, asyncHandler(
    async (req, res, next) => {
        const query={
            role:req.user.role
           }
        var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
        if (cdata.companymanage) {
       const role=req.params.id
       const query={
           _id:role
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
    }
    else {
      return rc.setResponse(res, { error: { code: 403 } });
  } 
}   
));
router.put('/:id', auth, asyncHandler( 
    async (req, res, next) => {
        const newData=req.body
        newData.admin=req.user.id
        const query={
            role:req.user.role
           }
        var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
        if (cdata.addnewcompany) {
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
            return rc.setResponse(res, { error: { code: 403 } });
        } 
    }
));
router.delete('/:id', auth, asyncHandler( //FIXME:need to change country if required
    async (req, res, next) => {
      const query={
            role:req.user.role
           }
        var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
        if (cdata.listcompany) {
        const id = req.params.id;
        query={_id:req.params.id}
        // const rdata = await TableModel.getDataByQueryFilterDataOne(query);
        // query={role:rdata.role}
        // const count = await TableModelUser.getDataCountByQuery(query); 
        // if(!count){
            const data = await TableModel.dataDeleteByQuery(query);
            if (data) {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Deleted Successfully',
                    data: data
                });
            } else {
                return rc.setResponse(res, {
                    msg: "Data not Found"
                })
            }

        // }else{
        //     return rc.setResponse(res, {
        //         msg: "Can't Delete this Role it is using by some Users"
        //     })
        // }
    } else {
        return rc.setResponse(res, { error: { code: 403 } });
    }  
       
    }
));
//FIXME:Not Using right now




module.exports = router;