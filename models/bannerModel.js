const mongoose =require('mongoose')
 const bannerSchema = new mongoose.Schema(
    {
        name:String,
        heading:String,
        image:String,
        
    },{timestamps:true}
 )
 const bannerModel =mongoose.model('banner',bannerSchema)
 module.exports=bannerModel