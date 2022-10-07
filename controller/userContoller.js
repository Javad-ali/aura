var express = require('express');
var createError = require('http-errors');
var router = express.Router();
const mongoose = require('mongoose');
const adminModel = require('../models/adminModel');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const categoryModel = require('../models/categoryModel');
const subCategoryModel = require('../models/subCategoryModel');
const async = require('hbs/lib/async');
const couponModel = require('../models/couponModel');
const bannerModel = require('../models/bannerModel');
const wishlistModel = require('../models/wishlistModal');
const cartModel = require('../models/cartModel');
const addressModel = require('../models/addressModel');
const orderModel = require('../models/orderModel')
const Razorpay = require('razorpay');
const twilioController= require('../controller/twilioController');
const createHttpError = require('http-errors');
const { path } = require('../app');

///============HOME PAGE====================/////////
exports.getHomepage = async (req, res,next) => {
    try {
        
        const user = await userModel.findById(req.user.user._id, { password: 0 }).lean()
    
        const products = await productModel.find().populate('category').lean()
        const cart = await cartModel.findOne({ userId: req.user.user._id }).lean().populate({ path: 'products', populate: 'product' })
        const category = await categoryModel.find().lean()
        const banner = await bannerModel.find().lean()
        const wishlist = await wishlistModel.findOne({ userId: req.user.user._id }).populate({ path: "products", populate: "product" })
        console.log(user);
        res.render('Users/usersHome', { products, category, user, cart, banner, wishlist })
    } catch (error) {
        next(createError(404));
    }
}
///=======================================================================================/////////

////=================PROFILE===================================//////
exports.getProfile = async (req, res,next) => {
    try {
        const address = await addressModel.findOne({ userId: req.user.user._id }).lean()
        const user = await  userModel.findById(req.user.user._id)
        console.log(address);
        res.render('Users/profile/profile', { layout: 'profilelayout', address,user})
        
    } catch (error) {
        next(createError(404));
    }
}
exports.editProfile = async (req,res,next)=>{
    try {
        await userModel.findByIdAndUpdate(req.user.user._id,{$set:req.body})
        res.redirect('/users/profile')
    } catch (error) {
        next(createError(404));
        
    }
}
////=====================================================///////

////======================ABOUT================================////

exports.getAboutPage =(req,res,next)=>{
    try {
        
        res.render('Users/about')
    } catch (error) {
        next(createError(404));
    }
}

//========================ORDERS========================////////
exports.getAllOrders = async(req,res,next)=>{
    try {
        const orders = await orderModel.find({userid:req.user.user._id}).populate({ path: 'products', populate: 'product' }).populate('userid')
        
        res.render('Users/profile/orders',{layout:'profilelayout',orders})
        
    } catch (error) {
        next(createError(404));
    }
}

//==================ORDER DETAILS===========================//////
exports.getOrderDetails =async(req,res,next)=>{
    try {
        
        const orderDetails= await orderModel.findOne({userid:req.user.user._id,_id:req.params.id}).populate({ path: 'products', populate: 'product' }).populate('userid')
        const total = await orderDetails.products.reduce((accumulator,currentValue)=> accumulator+currentValue.price,0)
        console.log(total);
        res.render('Users/profile/orderDetails',{orderDetails})
        console.log(orderDetails);
    } catch (error) {
        next(createError(404));
    }
    }
///===========================================================///

////=================ADDRESS==========================//////////
exports.getAllAddress= async (req,res,next)=>{
    try {
        
        const oldAddress= await addressModel.find({userId:req.user.user._id})
            const address = await addressModel.findOne({ userId: req.user.user._id }).lean()
    
            res.render('Users/profile/address', { layout: 'profilelayout', address })
    } catch (error) {
        next(createError(404));

    }


}

exports.addAddress = async (req, res,next) => {
    try {
        
        const oldAddress = await addressModel.findOne({ userId: req.user.user._id })
        const addresses = {
            address: req.body.address,
            state: req.body.state,
            city: req.body.city,
            pin: req.body.pin,
            contact: req.body.contact
        }
        if (oldAddress) {
            await addressModel.findByIdAndUpdate(oldAddress._id, { $push: { addresses } })
            res.redirect(`/users/address`);
    
        } else {
            const newAddress = await new addressModel({ userId: req.user.user._id, addresses })
            newAddress.save()
    
            res.redirect(`/users/checkout`);
    
        }
    } catch (error) {
        next(createError(404));

    }
}

exports.getAaddress = async (req, res,next) => {
    try {
        const ALLaddress = await addressModel.findOne({ userId: req.user.user._id })
        const address = ALLaddress.addresses.filter(e => e._id == req.params.addId)
        res.json({ address })
        
    } catch (error) {
        next(createError(404));

    }

}

exports.updateAaddress = async (req, res,next) => {
    try {
        
        const address = await addressModel.updateOne({ 'addresses._id': req.params.addId }, { $set: { 'addresses.$': req.body } })
        res.redirect(`/users/address`)
    } catch (error) {
        next(createError(404));

    }
}

exports.deleteAaddress = async (req, res,next) => {
    try {
        const address = await addressModel.findOneAndUpdate({ userId: req.user.user._id }, { $pull: { addresses: { _id: req.params.addId } } })
        console.log(address)
        res.json({ status: "success" })
        
    } catch (error) {
        next(createError(404));

    }
}

///////=========================================================================/////

/////=========================PRODUCT============================================////
exports.getAproduct = async (req, res,next) => {
    try {
        const product = await productModel.findById(req.params.proid);
        res.json({ product })
        
    } catch (error) {
        next(createError(404));

    }
        
    }
////===========================================================================///////

//////========================CART=============================================//////
exports.getCart = async (req, res,next) => {
    try {
        const cart = await cartModel.findOne({ userId: req.user.user._id }).populate({ path: 'products', populate: { path: 'product' } }).lean()
        const user = await userModel.findById(req.user.user._id).lean()
        const category = await categoryModel.find().lean()
        const wishlist = await wishlistModel.findOne({ userId: req.user.user._id }).populate({ path: "products", populate: "product" })
    
    
        res.render('Users/cart', { cart, user, category, wishlist })
        
    } catch (error) {
        next(createError(404));
 
    }
}

exports.postCart = async (req, res,next) => {
    try {
        const discountPrice = await productModel.findById(req.body.prodId)
        console.log(discountPrice,"DDDDBBBBB")
        const totalPrice = (discountPrice.product.discountPrice * 1) * req.body.qty
        const oldCart = await cartModel.findOne({ userId: req.user.user._id })
        console.log(req.body.qty)
        if (oldCart) {
            const finalPrice = oldCart.products.reduce((acc, crr) => {
                return acc + crr.price
            }, 0)
            const oldProduct = oldCart.products.find(e => e.product == req.body.prodId)
     
            if (oldProduct) {
                if (oldProduct.qty == 1 && req.body.qty == -1) {
                    console.log('pull');
                    await cartModel.updateOne({ 'products.product': req.body.prodId }, { "$pull": { 'products': { '_id': oldProduct._id } } })
                    await cartModel.findByIdAndUpdate(oldCart._id, { $inc: {totalPrice } })
                }else{
    
                    const cart = await cartModel.updateOne({ 'products.product': req.body.prodId }, { '$inc': { 'products.$.qty': req.body.qty, 'products.$.price': totalPrice } })
                    await cartModel.findByIdAndUpdate(oldCart._id, { $inc: { totalPrice } })
                    console.log(cart)
                }
    
    
            } else {
    
                const products = {
                    product: req.body.prodId,
                    qty: req.body.qty,
                    price: totalPrice
                }
                const cart = await cartModel.findByIdAndUpdate(oldCart._id, { $push: { products: products }, $inc: { totalPrice } })
            }
        } else {
    
            const products = {
                product: req.body.prodId,
                qty: req.body.qty,
                price: totalPrice
            }
    
            const cart = await new cartModel({ userId: req.user.user._id, products, totalPrice })
            cart.save()
            console.log(cart)
        }
        res.json({ status: "success" })
        
    } catch (error) {
        next(createError(404));

    }
}


exports.deleteCart = async(req,res,next)=>{
    try {
        const pullAmount= await cartModel.findOne({userId:req.user.user._id}).populate({path:'products'})
        const cart = await cartModel.updateOne({userId:req.user.user._id},{$pull:{products:{product:req.params.id}}})
       const deletecart= await pullAmount.products.find(e=>e.product== req.params.id)
       const totalPrice = deletecart.price*-1
       await cartModel.findByIdAndUpdate(pullAmount._id, { $inc: {totalPrice} })

         console.log(deletecart.price);
        res.json({message:"deleted successfully"})
    } catch (error) {
        next(createError(404));
        
    }
}
///////===============================================================================================////////

/////===========================WISHLIST===============================================================//////////
exports.getWishlist = async (req, res,next) => {
    try {
 
    } catch (error) {

    }
}
exports.addWishlist = async (req, res,next) => {
    console.log(req.body)
    const oldwhishlist = await wishlistModel.findOne({ userId: req.user.user._id })
    if (oldwhishlist) {
        const oldproduct = oldwhishlist.products.find(e => e.product == req.body.prodId)
        if (oldproduct) {
            res.json({ message: "product already in wishlist" })
        } else {

            const wishlist = await wishlistModel.findOneAndUpdate({ userId: req.user.user._id }, { $push: { products: { product: req.body.prodId } } }, { new: true })
            res.json({message:"updated successfully"})
        }
    } else {
        const wishlist = await new wishlistModel({ userId: req.user.user._id, products: { product: req.body.prodId } })
        wishlist.save()
        res.json({message:"added successfully"})

    }
}

exports.deleteWishlist = async (req,res,next)=>{
    try {
        const wishlist = await wishlistModel.updateOne({userId:req.user.user._id},{$pull:{products:{product:req.params.id}}})
        res.json({message:"reomved successfully"})
    } catch (error) {
        next(createError(404));
        
    }
}
//////====================================================================================================//////////

////////=========================CHECKOUT===========================================================////

exports.getCheckout = async (req, res,next) => {
    const cart = await cartModel.findOne({ userId: req.user.user._id }).populate({ path: 'products', populate: { path: 'product' } }).lean()
    const user = await userModel.findById(req.user.user._id).lean()
    const category = await categoryModel.find().lean()
    const address = await addressModel.find({ userId: req.user.user._id })
    console.log(address);
    res.render('Users/checkOut', { cart, user, category, address })
}

exports.postCheckout = async (req, res,next) => {
    try {
        const cart = await cartModel.findOne({ userId: req.user.user._id })
        const address = await addressModel.findOne({ userId: req.user.user._id })
        const coupon = await couponModel.findOne({couponCode:req.body.couponCode})
        const ad = address.addresses.find(e => e._id == req.body.address)
        console.log(req.body);
        if (req.body.paymentType == 'COD') {
            const order = await new orderModel({ userid: cart.userId, products: cart.products, grandTotal: cart.totalPrice-coupon.discount,shipping: ad, paymentType: req.body.paymentType,status:'pending' })
            await cartModel.findOneAndDelete({userId:req.user.user._id})
            console.log(order)
            order.save()
            res.json({message:"order placed successfully",url:"/users" ,status:true})
        }else{
            const orders = await new orderModel({ userid: cart.userId, products: cart.products, grandTotal: cart.totalPrice-coupon.discount, shipping: ad, paymentType: req.body.paymentType })
           
            orders.save()
            const instance = new Razorpay({
                key_id: process.env.RAZORPAYID,
                key_secret: process.env.RAZORPAY_SECRETKEY,
              });
              const options = {
                amount: orders.grandTotal*100,
                currency: "INR",
              };
              instance.orders.create(options, function(err, order) {
                console.log(order);
                res.json({order,orderid:orders._id})
              });
        }
    } catch (error) {
        next(createError(404));

    }
}
//////========================================================================================================/////////////////

////=================================COUPON====================================///////
exports.postAcoupon = async (req, res,next) => {
    console.log(req.body);

    try {
        const coupon = await couponModel.findOne({ couponCode: req.body.coupon })
        const cart = await cartModel.findOne({userId:req.user.user._id})
         const totalPrice =cart.totalPrice-(cart.totalPrice*coupon?.discount/100)
         console.log(cart);
         if (coupon) {
            const  discount =(cart.totalPrice*coupon.discount/100)
            console.log('working')
            res.json({discount, totalPrice,status:"success"})
        } else {

            res.json({ message: "invaild coupon",})
        }
        console.log(coupon);
    } catch (error) {
        next(createError(404));

    }
}
//===================================================================================///

//==============================CHANGE PASSWORD==================================/////
exports.changePassword= async (req,res,next)=>{
 try {
    console.log(req.body);
    const oldPassword= await userModel.findById(req.user.user._id)
    const oldPsd = await bcrypt.compare(req.body.oldPassword, oldPassword.password)
    if(oldPsd){
        const hash = await bcrypt.hash(req.body.newPassword,10)
        await userModel.findByIdAndUpdate(req.user.user._id,{$set:{password:hash}})
        res.json({message:"password changed successfully"})
    }else{
        res.json({message:"wrong password"})
    }
 } catch (error) {
    next(createError(404));
    
 }

}

exports.getOtpPage = (req,res,next)=>{
 res.render('Users/Otp')
}
exports.postOtp= async(req,res,next)=>{
    try {
        console.log(req.user.user,req.body)
       const data =await twilioController.verifyOtp(req.user.user.phoneNumber,req.body.otp)
        if (data.valid) {
            res.redirect('/users')
        } else {
            res.render('Users/Otp',{invalid:true})
        }
       
    } catch (error) {
        next(createError(404));
        
    }
}