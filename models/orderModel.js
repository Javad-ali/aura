const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({

    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "product" }, qty: Number, price: Number
    }],
    grandTotal: Number,
    paymentType: String,
    Paid: false,
    status: String,
    shipping:{address:String,state:String,city:String,pin:Number,contact:Number},
},{timestamps:true})
const orderModel = mongoose.model('order',orderSchema);
 module.exports=orderModel
