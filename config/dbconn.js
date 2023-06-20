const mongoose =require("mongoose");
//mongoose.connect('mongodb://username:password@host:port/database?options...');
mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/newdb_snaxsmart",{
   // useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("connection is successful");
}).catch((e)=>{
    console.log("No Connection");
})