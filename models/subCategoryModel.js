const mongoose =require('mongoose')
const subCategorySchema = new mongoose.Schema(
    {
        category:{type:mongoose.Schema.Types.ObjectId,
        ref:"category"},
        subCategory:[{name:String}],
    },{timestamps:true}
)

const subCategoryModel =mongoose.model('subCategory',subCategorySchema)
 module.exports=subCategoryModel