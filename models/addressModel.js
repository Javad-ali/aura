const mongoose = require('mongoose')
const addressSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,
        ref:"users"},
    addresses:[{address:String,state:String,city:String,pin:Number,contact:Number}]
})
const addressModel = mongoose.model('address',addressSchema);
module.exports =addressModel