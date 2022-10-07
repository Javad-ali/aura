const mongoose =require('mongoose')
const bcrypt = require('bcrypt')

const userSchema=mongoose.Schema({

     name:String,
     email:{
        type:String,
        unique:true
     },
     password:String,
     status:{type:Boolean,
    default:true} ,

    phoneNumber:Number,

    coupon:[{ type:mongoose.Schema.Types.ObjectId,
        ref:"coupon"
    }],


},{timestamps:true});
userSchema.pre('save',async function(next){
    try{
        const hash =await bcrypt.hash(this.password,10)
        this.password=hash
        next();
    }catch(err){
        next(err);
    }
}) 

const userModel=mongoose.model('users',userSchema);
module.exports =userModel;