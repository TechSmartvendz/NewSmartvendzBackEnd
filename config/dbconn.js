const mongoose =require("mongoose");
mongoose.set('strictQuery', false);
// mongoose.connect("mongodb://127.0.0.1:27017/newdb_snaxsmart",{
mongoose.connect("mongodb+srv://SmartVendz:Smartvendz@cluster0.wt4bcv3.mongodb.net/inventory?retryWrites=true&w=majority",{
   // useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("Connected with mongodb");
}).catch((e)=>{
    console.log("No Connection");
})