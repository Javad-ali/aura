const mongoose =require("mongoose")



const productSchema =mongoose.Schema({

    product:{
        itemName:String,brandName:String,price:Number,discountPrice:Number,description:String,productDetails:String
    },

    stock:Number,
    coverImage:String,
    images:[String],
    warranty:Number,
    category:{type:mongoose.Schema.Types.ObjectId,
        ref:"category"},
    subCategory:String
    
},{timestamps:true})


const productModel =mongoose.model('product',productSchema)

module.exports = productModel