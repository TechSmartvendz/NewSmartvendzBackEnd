const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const TableModelUser= require('../model/m_user_info');
const TableModelCompanyAdmin= require('../model/m_company_admin');
const TableModelPermission = require('../model/m_permission');
const TableModel = require('../model/m_company');
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
      let query={
            role:req.user.role
           }
        var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
        if (cdata.addnewcompany) {
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
router.post('/CompanyUsers', auth, asyncHandler(
    async (req, res) => {
        const query={
            role:req.user.role
           }
        var pdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
        if (pdata.addnewcompany) 
        {
            const query={
                user_id:req.body.assign_user
               }
            var cdata = await TableModelUser.getDataByQueryFilterDataOne(query);
           // console.log("🚀 ~ file: r_company.js:195 ~ cdata", cdata)
            if (!cdata) {
                return rc.setResponse(res, {
                    msg: 'User not Found'
                });
            }else {
                var newRow =req.body
                newRow.created_by=req.user.id
                newRow.assign_user=cdata.id
                 newRow = new TableModelCompanyAdmin(newRow);
                 
                if (!newRow) {
                    return rc.setResponse(res, {
                        msg: 'No Data to insert'
                    });
                }
                const data = await TableModelCompanyAdmin.addRow(newRow);
                if (data) {
                    return rc.setResponse(res, {
                        success: true,
                        msg: 'Data Inserted',
                        data: data
                    });
                }
            }
    } else {
        return rc.setResponse(res, { error: { code: 403 } });
    }    
}
)
);

router.put('/CompanyUsers/:id', auth, asyncHandler(
    async (req, res) => {
        const query={
            role:req.user.role
           }
        var pdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
        if (pdata.addnewcompany) 
        { let query={
                user_id:req.body.assign_user
               }
            var cdata = await TableModelUser.getDataByQueryFilterDataOne(query);
            if (!cdata) {
                return rc.setResponse(res, {
                    msg: 'User not Found'
                });
            }else {
                var newRow =req.body
                newRow.created_by=req.user.id
                newRow.assign_user=cdata.id
                query={
                    _id:req.params.id
                   }
                var newRow = await TableModelCompanyAdmin.updateByQuery(query,newRow);
                if (!newRow) {
                    return rc.setResponse(res, {
                        msg: 'No Data to update'
                    });
                }
                else {
                    return rc.setResponse(res, {
                        success: true,
                        msg: 'Data Updated',
                        data: newRow
                    });
                }
            }
    } else {
        return rc.setResponse(res, { error: { code: 403 } });
    }    
}
)
);

router.delete('/CompanyUsers/:id', auth, asyncHandler(
    async (req, res) => {
        const query={
            role:req.user.role
           }
        var pdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
        if (pdata.addnewcompany) 
        { let query={
                _id:req.params.id
               }
            var data = await TableModelCompanyAdmin.dataDeleteByQuery(query);
            if (!data) {
                return rc.setResponse(res, {
                    msg: 'Assign User not Found'
                });
            }else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Deleted',
                    data: data
                });
            }
    } else {
        return rc.setResponse(res, { error: { code: 403 } });
    }    
}
)
);

router.get('/CompanyUsers/:id', auth, asyncHandler(
    async (req, res, next) => {
        const query={
            role:req.user.role
           }
        var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
        if (cdata.listcompany) {

            const query={
                _id:req.params.id
               }
            var cdata = await TableModel.getDataByQueryFilterDataOne(query);
            if (cdata.companyid) {
        const companyid=cdata.companyid
        const data = await TableModelCompanyAdmin.getDataforTable(companyid);
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
        return rc.setResponse(res, {
            msg: "Data not Found"
        })
    }
    }
  else {
    return rc.setResponse(res, { error: { code: 403 } });
}    
}
)
);

router.get('/CompanyUsers/:id/:assignid', auth, asyncHandler(
    async (req, res, next) => {
        const query={
            role:req.user.role
           }
        var cdata = await TableModelPermission.getDataByQueryFilterDataOne(query);
        if (cdata.addnewcompany) {

        
               let assignid=req.params.assignid
            //    console.log("🚀 ~ file: r_company.js:276 ~ assignid", assignid)
        const data = await TableModelCompanyAdmin.getDataForEditFormAssignUser(assignid);
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
)
);




module.exports = router;