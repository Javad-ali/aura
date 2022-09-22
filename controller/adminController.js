var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const adminModel = require('../models/adminModel');
const userModel = require('../models/userModel');
const productModel =require('../models/productModel');
const jwt=require('jsonwebtoken')
const bcrypt =require('bcrypt');
const categoryModel = require('../models/categoryModel');
const subCategoryModel = require('../models/subCategoryModel');
const async = require('hbs/lib/async');
const couponModel = require('../models/couponModel');
const bannerModel = require('../models/bannerModel')





exports.getLoginPage= function(req, res, next) {
    res.render('admin/adminLogin')
  }


  exports.postLogin =async(req,res)=>{
    try {
      console.log(req.body)
      
      const admin=await adminModel.findOne({email:req.body.email})
      console.log(admin)
      if (admin) {
        const validate=await bcrypt.compare(req.body.password,admin.password)
          console.log(validate)
          if(validate){
            const token=jwt.sign({admin},process.env.JWT_SECRT_KEY)
            res.cookie('jwt',token,{
              // expires: new Date(Date.now()+100*1000),
              httpOnly:true
            }).json({url:`/admin/home`})
          }else{
            res.json({status:200,message:"Invaild Email Or Password"})
          }
        
        
      } else {
        res.json({status:200,message:"Invaild Email Or Password"})
        
      }
    } catch (error) {
      console.log("hello")
      res.json({
        status:200,message:"Invaild Email Or Password"
      })
    }
  
  }


//   ========== HOME ========//
exports.getHomePage=async(req,res)=>{
    const user=await userModel.find()
    res.render('admin/adminHome',{layout:'adminlayout'})
  }


/////////////////////////////////
// ========= PRODUCT ====== ///


exports.getAllProducts= async(req,res)=>{
  try {
      console.log("hello")
      const products= await productModel.find({}).lean()
      const category = await categoryModel.find({}).lean()
      console.log(products.stock)
      res.render('admin/productpage',{layout:'adminlayout',products,category})
      
  } catch (error) {
      console.log(error)
  }
}

exports.addProduct= async(req,res)=>{
  try {
    console.log(req.body)
    const {itemName,brandName,price,discountPrice,description,productDetails,stock,warranty,category,subCategory}=req.body
    console.log(category)
    const images= req.file.filename
    const newProduct =await  productModel.create({product:{itemName,brandName,price,discountPrice,description,productDetails},stock,coverImage:images,warranty,category,subCategory})
    console.log(newProduct)
    res.redirect('/admin/products')
  } catch (error) {
    console.log(error);
    
  }
}




exports.deleteProduct =async(req,res)=>{
  try {
    await productModel.findByIdAndDelete(req.body.productid)
    res.json({message:"Item deleted successfully"})
  } catch (error) {
    console.log(error);
    
  }
}  

// single product /////

exports.getAProduct= async(req,res)=>{
  try {
    console.log(req.admin.admin)
    const product =await productModel.findById(req.params.id).lean()
    
    res.render('admin/productdetails',{layout:'adminlayout',product,adminid:`${req.admin.admin._id}`})

  } catch (error) {
    
  }
}
exports.editProduct=async(req,res)=>{
  try {
    await productModel.findByIdAndUpdate(req.params.id,{$set:req.body})
    res.redirect('/admin/products')
  } catch (error) {
    console.log(error)
  }
}


///////////////////////////////

//========== CATEGORYS========//

exports.getAllCategory= async(req,res)=>{
  try {
    const category = await categoryModel.find().lean()
    const subCategory = await subCategoryModel.find().populate('category')
    console.log(subCategory);
    res.render('admin/category',{layout:'adminlayout',category})
  } catch (error) {
    console.log(error);
  }
}
exports.addCategory= async(req,res)=>{
  try {
    const name = {name:req.body.subCategory}
    const category =await new categoryModel({category:req.body.category,image:req.file.filename})
    category.save();
    res.redirect('/admin/categorys')
  } catch (error) {
    console.log(error)
  }
}
exports.getACategory= async(req,res)=>{
  try {
  
    const category = await categoryModel.findById(req.params.id)
    res.json
    ({category})
  } catch (error) {
    console.log(error);
  }
}

exports.editCategory =async(req,res)=>{
  try {
    console.log(req.file)
    const category =await categoryModel.findByIdAndUpdate(req.params.id,{$set:{category:req.body.category}})
    res.json({message:"hai"})

  } catch (error) {
    console.log(error);
  }
}
exports.addSubCategory =async(req,res)=>{
  try {
    const oldsub = await subCategory.findOne({category:req.params.id})
    if(oldsub){
      console.log('hgfd')
const subCategory = await subCategoryModel.findOneAndUpdate({category:req.params.id},{$push:{subCategory:req.body.subCategory}})
    }else{
      const subCategory=await subCategoryModel.create({subCategory:req.body.subCategory,category:req.params.id})
    }
    res.json({message:"helo"})
  } catch (error) {
    console.log(error);
  }
}

exports.deleteCategory= async(req,res)=>{
  await categoryModel.findByIdAndDelete(req.params.id)
  res.json({message:"category deleted successfully"})
}
///////////////////////////////


//===========USERS=========///

exports.getUserData= async(req,res)=>{
    try {
        console.log("hello")
        const users= await userModel.find().lean()
        console.log(users)
        res.render('admin/userpage',{layout:'adminlayout',users})
        
    } catch (error) {
        console.log(error)
    }
}

exports.blockUser =async(req,res)=>{
  try {
    await userModel.findByIdAndUpdate(req.body.userid,{$set:{status:false}})
    res.json({message:'user blocked successfully'})
  } catch (error) {
    console.log(error)
  }
}

exports.unblockUser =async(req,res)=>{
  try {
    await userModel.findByIdAndUpdate(req.body.userid,{$set:{status:true}})
    res.json({message:'user unblocked successfully'})
  } catch (error) {
    console.log(error)
  }
}

//==============COUPON===========//

exports.getAllCoupon= async (req,res)=>{
  try {
    const coupon= await couponModel.find()
    res.render('admin/coupon',{layout:'adminlayout',coupon})
  } catch (error) {
    console.log(error);
    
  }
}

exports.addCoupon = async (req,res)=>{
 try {
const coupon = await new couponModel({couponCode:req.body.couponCode,couponName:req.body.couponName,discount:req.body.discount})
coupon.save()
res.redirect('/admin/coupon')
 } catch (error) {
  console.log(error);
  
 }
}

exports.editCoupon = async (req,res)=>{
  try {
    console.log(req.body);
    const coupon = await couponModel.findByIdAndUpdate(req.params.couponId,{$set:req.body})
    res.redirect('/admin/coupon')
  } catch (error) {
    console.log(error);
    
  }
}

exports.deleteCoupon =  async (req,res)=>{
  try {
    await couponModel.findByIdAndDelete(req.params.couponId)
    res.json({message:"deleted successfully"})
  } catch (error) {
    console.log(error);
    
  }
}

exports.getAcoupon = async (req,res)=>{
  try {
    const coupon= await couponModel.findById(req.params.couponId)
    res.json({coupon})
  } catch (error) {
    console.log(error);
    
  }
}
///=========BANNER======////////
exports.getAllBanner =async(req,res)=>{
  try {
    const banner= await bannerModel.find()
    console.log(banner);
    res.render('admin/banner',{layout:'adminlayout',banner})

  } catch (error) {
    console.log(error);
    
  }
}
exports.addBanner = async (req,res)=>{
  try {
 const banner = await new bannerModel({name:req.body.name,heading:req.body.heading,image:req.file.filename})
 console.log(banner);
 banner.save()
 res.redirect('/admin/banner')
  } catch (error) {
   console.log(error);
   
  }
 }

 exports.deleteBanner =  async (req,res)=>{
  try {
    await bannerModel.findByIdAndDelete(req.params.bannerId)
    res.json({message:"deleted successfully"})
  } catch (error) {
    console.log(error);
    
  }
}

exports.getABanner = async (req,res)=>{
  try {
    const banner= await bannerModel.findById(req.params.bannerId)
    res.json({banner})
  } catch (error) {
    console.log(error);
    
  }
}