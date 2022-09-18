const mongoose =require('mongoose')
 const categorySchema = new mongoose.Schema(
    {
        category:String,
        image:String
    }
 )
 const categoryModel =mongoose.model('category',categorySchema)
 module.exports=categoryModel