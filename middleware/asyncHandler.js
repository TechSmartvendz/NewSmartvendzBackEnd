const rc = require('./../controllers/responseController');

module.exports.asyncHandler =(fn)=>async(req,res,next)=>{
    console.log(req.originalUrl)
    console.log("🚀 ~ file: asyncHandler.js:5 ~ module.exports.asyncHandler= ~ req.query", req.query)
    console.log("🚀 ~ file: asyncHandler.js:5 ~ module.exports.asyncHandler= ~ req.params", req.params)
    console.log("🚀 ~ file: asyncHandler.js:5 ~ module.exports.asyncHandler= ~ req.body", req.body) 
    try{
        await fn(req,res,next)
    }catch(error){
       console.log("🚀 ~ file: asyncHandler.js:11 ~ module.exports.asyncHandler= ~ error", error)
        return rc.setResponse(res, {
            error:error
        });
    }
}

module.exports.asyncHandler2 =(fn)=>async(data)=>{
   console.log("🚀 ~ file: asyncHandler.js:18 ~ module.exports.asyncHandler2= ~ data", data)
    // console.log(data)
    // console.log("🚀 ~ file: asyncHandler.js:5 ~ module.exports.asyncHandler= ~ req.query", req.query)
    // console.log("🚀 ~ file: asyncHandler.js:5 ~ module.exports.asyncHandler= ~ req.params", req.params)
    // console.log("🚀 ~ file: asyncHandler.js:5 ~ module.exports.asyncHandler= ~ req.body", req.body) 
    try{
        await fn(data)
    }catch(error){
        console.log("🚀 ~ file: asyncHandler.js:26 ~ module.exports.asyncHandler2= ~ error", error)
        return rc.setResponse(res, {
            error:error
        });
    }
}

