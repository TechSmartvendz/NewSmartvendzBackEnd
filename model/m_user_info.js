const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const TableName = "user_info";

const TableSchema = mongoose.Schema({
   
    user_id: {
        type:String,
        required: true,
        trim: true,
        unique: true
    },
    user_first_name: {
        type: String,
        // required: true,
        trim: true
    },
    user_middle_name: {
         type: String,
        // required: true,
        trim: true    
    },
    user_last_name: {
         type: String,
        // required: true,
        trim: true   
     },
    user_display_name: {
        type: String,
    },
    user_mobile: {
        type: Number,
    },
    user_email: {
        type: String,
    },
    user_alter_mobile: {
        type: Number,
    },
    user_curr_loc_lat: {
        type: String,
    },
    user_per_address: {
        type: String,
    },
    user_current_address: {
        type: String,
    },
    user_country: {
        type: String,
    },
    user_state: {
        type: String,
    },
    user_city: {
        type: String,
    },
    user_curr_loc_long: {
        type: String,
    },
    user_profile_pic: {
        type: String,
        // default: 'defaultProfileImg.jpg'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: String,
    },
    last_update: {
        type: Date,
    },
    delete_status: {
        type:Boolean,
        require:true,
        default:false
    },
    role: {
        type:String,
        require:true,
        default:"Role N/A"
    },
    otp: {
        type:String,
        default:""
    },
    token: {
            type: String,
            required: true
        },
    password:{
        type: String,
        required: true,

    },
    admin: {
            type: String,
            required: true,
            default:"null"
    }  



});

//middleware for JWT TOken.....
TableSchema.methods.generateAuthToken = async function () { //middleware for generate token and store this registration token in DB token array
        console.log("generating token ")
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);//generate token by jwt.sign method.
        console.log(token);
        this.token=token;
        doc= await this.save()
        console.log("🚀 ~ file: m_user_info.js:115 ~ doc", doc)  
        return token;// return token to middleware method call in server.js 
   
}

const Table = (module.exports = mongoose.model(TableName, TableSchema));
const OldTable = mongoose.model("old" + TableName, TableSchema);
//TODO:THIS IS USING at /SuperAdminRegistration
module.exports.addRow = async (newRow) => {
    const data = await  newRow.save();
    return data;
};
//TODO:THIS IS USING at /User/:id
module.exports.getLoginData = async (user_id) => {

    const data = await Table.findOne({user_id:user_id},{token:1,password:1});
    return data; 
};
//TODO:THIS IS USING at Not using right now
module.exports.getDataByIdFullData = async (id,admin) => {
    const data = await Table.findOne({_id:id,admin:admin});
    return data; 
};
//TODO:THIS IS USING at GET /User/:id
module.exports.getDataByIdFilterData = async (id,admin) => {
    const data = await Table.findOne({_id:id,admin:admin},{delete_status:0,token:0,password:0,otp:0,__v:0});
    return data; 
};
module.exports.getDataCount = async (id,admin) => {
    const data = await Table.findOne({_id:id,admin:admin}).count();
    return data; 
};
module.exports.getAllData = async (admin) => {
    const data = await Table.find({admin:admin},{delete_status:0,token:0,password:0,otp:0,__v:0});
    return data; 
};
module.exports.updateById = async (id,newdata,admin) => {
     const data = await Table.findByIdAndUpdate(id, { $set: newdata });
    //const data = await Table.find({admin:admin},{delete_status:0,token:0,password:0,otp:0,__v:0});
    return data; 
};




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports.updateRow = (id, newData, callback) => {
    newData.last_update = Date.now();
    Table.findByIdAndUpdate(id, { $set: newData }, callback);
};

module.exports.getData = callback => {
    Table.find(callback);
};



module.exports.getDataByFieldName = (fieldName, fieldValue, callback) => {
    let query = {};
    query[fieldName] = fieldValue;
    Table.find(query, callback);
};

module.exports.getDataByFieldNames = (fieldNames, fieldValues, callback) => {
    let query = {};
    for (let i = 0; i < fieldNames.length; i++) {
        const fieldName = fieldNames[i];
        const fieldValue = fieldValues[i];
        query[fieldName] = fieldValue;
    }
    Table.find(query, callback);
};

module.exports.deleteTableById = (id, callback) => {
    Table.findById(id, (err, doc) => {
        if (err) {
            callback(err, null);
        } else {
            if (!doc) {
                callback(err, doc);
            } else {
                const dataToDel = new OldTable(doc);
                OldTable.insertMany(doc)
                    .then(val => {
                        Table.findByIdAndDelete(id, callback);
                    })
                    .catch(reason => {
                        callback(reason, null);
                    });
            }
        }
    });
};

/**
 * custom functions
 */



// function for updating value using user id
module.exports.updateViaUser_idRow = (id, newData, callback) => {
    newData.last_update = Date.now();
    const filter = { user_id: id };
    console.log(newData);
    Table.findOneAndUpdate(filter,newData, callback);
};

module.exports.searchingModelforusername = (fieldName, fieldValue, callback) => {
    let query = {};
    query[fieldName] = fieldValue;
    Table.find(query, callback);

};