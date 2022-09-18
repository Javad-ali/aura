const express =require('express')
var router = express.Router();
const userModel =require('../models/userModel');
const productModel =require('../models/productModel');
const bcrypt =require('bcrypt');
const jwt = require('jsonwebtoken');
const cartModel = require('../models/cartModel');
const categoryModel = require('../models/categoryModel')


const checkLog = (req, res, next) => {
    const authHeader = req.headers.cookie;
    if (authHeader) {
        const token = authHeader.split('=')[1];
        if (token) {
            jwt.verify(token, process.env.JWT_SECRT_KEY, (err, client) => {
                if (err) {
                    next()
                } else {
                    res.redirect(`/users/`);
                }
            })
        } else {
            next()
        }
    } else {
        next()
    }
  
  }
  
//   ========= landing page ===== //
  router.get('/',checkLog,async function(req, res, next) {
    const products=await  productModel.find().lean().populate('category')
    const category= await categoryModel.find().lean()
    res.render('Users/landingPage',{products,category});
  });
  
  
  ///=============  login ================= //////////
  router.route('/login')
  .get(checkLog,(req,res)=>{
    res.render('Users/usersLogin')
  })
  .post(async(req,res)=>{
    try {
      
      const user=await userModel.findOne({email:req.body.email})
      if (user) {
        const validate=await bcrypt.compare(req.body.password,user.password)
          console.log(validate)
          if(user.status){
  
  
            if(validate){
              const token=jwt.sign({user},process.env.JWT_SECRT_KEY)
              res.cookie('jwt',token,{
                // expires: new Date(Date.now()+100*1000),
                httpOnly:true
              } ).json({url:`/users`})
            }else{
              res.json({status:200,message:"Invaild Email Or Password"})
            }
          }else{
            res.json({status:200,message:"sorry have been blocked"})
          }
        
        
      } else {
        res.json({status:200,message:"Invaild Email Or Password"})
        
      }
    } catch (error) {
      res.json({
        status:200,message:"Invaild Email Or Password"
      })
    }
  
  })
   ////======================================== ///////////
  
  //  ============== SIGN UP =============== //
  
  router.route('/signup').get(checkLog,(req,res)=>{
    res.render('Users/usersSignup')
  }).post(async(req,res)=>{
  try {
    const olduser = await userModel.findOne({email:req.body.email})
    if(olduser){
      res.json({status:"failed"})
    }else{
      
      const newUser = await  new userModel(req.body)
      newUser.save()
      const user=newUser
      const token= jwt.sign({user},process.env.JWT_SECRT_KEY)
      res.cookie('jwt',token,{
        // expires: new Date(Date.now()+100*1000),
        httpOnly:true
      }).json({url:`/users`})
    }
  } catch (error) {
    // res.json({status:"failed"})
  }
  })
  
  module.exports=router;