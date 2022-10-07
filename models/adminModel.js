const mongoose =require('mongoose')
const bcrypt = require('bcrypt')

const adminSchema=mongoose.Schema({

     name:String,
     email:{
        type:String,
        unique:true
     },
     password:String, 
},{timestamps:true});
adminSchema.pre('save',async function(next){
    try{
        const hash =await bcrypt.hash(this.password,10)
        this.password=hash
        next();
    }catch(err){
        next(err);
    }
}) 

const adminModel=mongoose.model('admin',adminSchema);
module.exports =adminModel;