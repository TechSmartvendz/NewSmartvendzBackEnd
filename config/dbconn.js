const mongoose =require("mongoose");
//mongoose.connect('mongodb://username:password@host:port/database?options...');
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://SmartVendz:Smartvendz@cluster0.wt4bcv3.mongodb.net/inventory?retryWrites=true&w=majority",{
   // useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("connection is successful");
}).catch((e)=>{
    console.log("No Connection");
})