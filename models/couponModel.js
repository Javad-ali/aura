const mongoose = require('mongoose')
const couponSchema =new mongoose.Schema({
        couponCode:String,
        couponName:String,
        discount:Number
},{timestamps:true})
const couponModel = mongoose.model('coupon',couponSchema)
module.exports = couponModel
