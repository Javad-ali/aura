const mongoose=require('mongoose')
const cartSchema =new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,
    ref:"users"},
    totalPrice:Number,
    products:[{product:{type:mongoose.Schema.Types.ObjectId,ref:"product"},price:Number,qty:Number}]
    
    
},{timestamps:true})

const cartModel = mongoose.model('cart',cartSchema)

module.exports = cartModel