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
const bannerModel = require('../models/bannerModel');
const wishlistModel = require('../models/wishlistModal');
const orderModel = require('../models/orderModel');
const e = require('express');





exports.getLoginPage= function(req, res, next) {
    res.render('admin/adminLogin')
  }


  exports.postLogin =async(req,res,next)=>{
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


//   ============== HOME ======================================//
exports.getHomePage=async(req,res,next)=>{
  try {
    const user=await userModel.find()
    const product= await productModel.find()
    const order = await orderModel.find().populate({ path: 'products', populate: 'product' }).populate('userid')
    const cancelOdr = (order.filter(e=>e.status=='Cancelled')).length
    const totalsales =  (order.map(e=>e.Paid)).length
    const cod =(order.filter(e=>e.paymentType=='COD')).length
    const deliveredOd = order.filter(e=>e.status=='delivered')
    const shipped = order.filter(e=>e.status=='shipped')
    const pending = order.filter(e=>e.status=='pending')
    const TotalRevenue = deliveredOd.reduce((accr,crr)=>accr+crr.grandTotal,0)

    const eachDaySale = await orderModel.aggregate([{$group: {_id: {day: {$dayOfMonth: "$createdAt"},month: {$month: "$createdAt"}, year:{$year: "$createdAt"}},total: {$sum: "$grandTotal"}}}]).sort({_id: -1})
    console.log(eachDaySale);
    // const TotalRevenue= order.reduce((accr,crr)=>{if(crr.status=='delivered'){
    //   return  accr+crr.grandTotal
    // }},0)
    console.log(deliveredOd);
    res.render('admin/adminHome',{layout:'adminlayout',user,product,order,totalsales,cancelOdr,cod,TotalRevenue,deliveredOd,shipped,pending,eachDaySale})
    
  } catch (error) {
    next(createError(404));

  }
  }


/////////////////////////////////


// ===================== PRODUCT ============================= ///


exports.getAllProducts= async(req,res,next)=>{
  try {
      console.log("hello")
      const products= await productModel.find({}).lean()
      const category = await categoryModel.find({}).lean()
      console.log(products.stock)
      res.render('admin/productpage',{layout:'adminlayout',products,category})
      
  } catch (error) {
    next(createError(404));
  }
}

exports.addProduct= async(req,res,next)=>{
  try {
    console.log(req.body)
    const {itemName,brandName,price,discountPrice,description,productDetails,stock,warranty,category,subCategory}=req.body
    console.log(category)
    const images= req.file.filename
    const newProduct =await  productModel.create({product:{itemName,brandName,price,discountPrice,description,productDetails},stock,coverImage:images,warranty,category,subCategory})
    console.log(newProduct)
    res.redirect('/admin/products')
  } catch (error) {
    next(createError(404));
    
  }
}




exports.deleteProduct =async(req,res,next)=>{
  try {
    await productModel.findByIdAndDelete(req.body.productid)
    res.json({message:"Item deleted successfully"})
  } catch (error) {
    next(createError(404));
    
  }
}  

// ===================single product =================================/////

exports.getAProduct= async(req,res,next)=>{
  try {
    console.log(req.admin.admin)
    const product =await productModel.findById(req.params.id).lean()
    
    res.render('admin/productdetails',{layout:'adminlayout',product,adminid:`${req.admin.admin._id}`})

  } catch (error) {
    next(createError(404));

  }
}
exports.editProduct=async(req,res,next)=>{
  try {
    await productModel.findByIdAndUpdate(req.params.id,{$set:req.body})
    res.redirect('/admin/products')
  } catch (error) {
    next(createError(404));
  }
}


//////////////////////////////////////////////////////////////////////////

//========== CATEGORYS========//

exports.getAllCategory= async(req,res,next)=>{
  try {
    const category = await categoryModel.find().lean()
    const subCategory = await subCategoryModel.find().populate('category')
    console.log(subCategory);
    res.render('admin/category',{layout:'adminlayout',category})
  } catch (error) {
    next(createError(404));
  }
}
exports.addCategory= async(req,res,next)=>{
  try {
    const name = {name:req.body.subCategory}
    const category =await new categoryModel({category:req.body.category,image:req.file.filename})
    category.save();
    res.redirect('/admin/categorys')
  } catch (error) {
    next(createError(404));
  }
}
exports.getACategory= async(req,res,next)=>{
  try {
  
    const category = await categoryModel.findById(req.params.id)
    res.json
    ({category})
  } catch (error) {
    next(createError(404));
  }
}

exports.editCategory =async(req,res,next)=>{
  try {
    console.log(req.file)
    const category =await categoryModel.findByIdAndUpdate(req.params.id,{$set:{category:req.body.category}})
    res.json({message:"hai"})

  } catch (error) {
    next(createError(404));
  }
}
exports.addSubCategory =async(req,res,next)=>{
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
    next(createError(404));
  }
}

exports.deleteCategory= async(req,res,next)=>{
  try {
    await categoryModel.findByIdAndDelete(req.params.id)
    res.json({message:"category deleted successfully"})
    
  } catch (error) {
    next(createError(404));

  }
}
/////////////////////////////////////////////////////////////////////////////


//===========USERS=========///

exports.getUserData= async(req,res,next)=>{
    try {
        console.log("hello")
        const users= await userModel.find().lean()
        console.log(users)
        res.render('admin/userpage',{layout:'adminlayout',users})
        
    } catch (error) {
      next(createError(404));
    }
}

exports.blockUser =async(req,res,next)=>{
  try {
    await userModel.findByIdAndUpdate(req.body.userid,{$set:{status:false}})
    res.json({message:'user blocked successfully'})
  } catch (error) {
    next(createError(404));
  }
}

exports.unblockUser =async(req,res,next)=>{
  try {
    await userModel.findByIdAndUpdate(req.body.userid,{$set:{status:true}})
    res.json({message:'user unblocked successfully'})
  } catch (error) {
    next(createError(404));
  }
}
//////===========================================================================//////////

////=================ORDERS============================///
exports.getAllOrders= async(req,res,next)=>{
  try {
    const orders= await orderModel.find().populate({ path: 'products', populate: 'product' }).populate('userid')
    console.log(orders);
    
    res.render('admin/order',{layout:'adminlayout',orders})
  } catch (error) {
    next(createError(404));
    
  }
}

//==============COUPON===========//

exports.getAllCoupon= async (req,res,next)=>{
  try {
    const coupon= await couponModel.find()
    res.render('admin/coupon',{layout:'adminlayout',coupon})
  } catch (error) {
    next(createError(404));
    
  }
}

exports.addCoupon = async (req,res,next)=>{
 try {
const coupon = await new couponModel({couponCode:req.body.couponCode,couponName:req.body.couponName,discount:req.body.discount})
coupon.save()
res.redirect('/admin/coupon')
 } catch (error) {
  next(createError(404));
  
 }
}

exports.editCoupon = async (req,res,next)=>{
  try {
    console.log(req.body);
    const coupon = await couponModel.findByIdAndUpdate(req.params.couponId,{$set:req.body})
    res.redirect('/admin/coupon')
  } catch (error) {
    next(createError(404));
    
  }
}

exports.deleteCoupon =  async (req,res,next)=>{
  try {
    await couponModel.findByIdAndDelete(req.params.couponId)
    res.json({message:"deleted successfully"})
  } catch (error) {
    next(createError(404));
    
  }
}

exports.getAcoupon = async (req,res,next)=>{
  try {
    const coupon= await couponModel.findById(req.params.couponId)
    res.json({coupon})
  } catch (error) {
    next(createError(404));
    
  }
}
////=======================================================================///

///=========BANNER======////////
exports.getAllBanner =async(req,res,next)=>{
  try {
    const banner= await bannerModel.find()
    console.log(banner);
    res.render('admin/banner',{layout:'adminlayout',banner})

  } catch (error) {
    next(createError(404));
    
  }
}
exports.addBanner = async (req,res,next)=>{
  try {
 const banner = await new bannerModel({name:req.body.name,heading:req.body.heading,image:req.file.filename})
 console.log(banner);
 banner.save()
 res.redirect('/admin/banner')
  } catch (error) {
    next(createError(404));
   
  }
 }

 exports.deleteBanner =  async (req,res,next)=>{
  try {
    await bannerModel.findByIdAndDelete(req.params.bannerId)
    res.json({message:"deleted successfully"})
  } catch (error) {
    next(createError(404));
    
  }
}

exports.getABanner = async (req,res,next)=>{
  try {
    const banner= await bannerModel.findById(req.params.bannerId)
    res.json({banner})
  } catch (error) {
    next(createError(404));
    
  }
}

///////=====================================================================///////////////

//=======================STATUS====================================//
exports.postStatus = async(req,res,next)=>{
   try {
    const status = req.body.status
    const orderid = req.body.orderid
    const  orderStatus = await orderModel.findByIdAndUpdate(req.body.orderid,{$set:{status}})
    res.json({orderStatus})
   } catch (error)
   {
    next(createError(404));
  }
  
}
///==================================================================================================////

///==========================CANCEL ORDER======================================================///
exports.cancelOrder = async(req,res,next)=>{
  try {
    console.log("sjhdgfhjsd", req.body.orderid);
    const cancelOd = req.body.cancelOd
    const orderid = req.body.orderid
    const cancelOrder = await orderModel.findByIdAndUpdate(req.body.orderid,{$set:{status:cancelOd}})
    res.json({cancelOrder})
  } catch (error) {
    next(createError(404));
    
  }
}