var express = require('express');
var router = express.Router();
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const userController = require('../controller/userContoller')
const { Router } = require('express');
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const async = require('hbs/lib/async');
const cartModel = require('../models/cartModel');
const addressModel = require('../models/addressModel')
const { findOne } = require('../models/userModel');
const verifytokenAndAuthorization = require('../controller/verifyToken');
const bannerModel = require('../models/bannerModel');
const adminController = require('../controller/adminController');
const orderModel = require('../models/orderModel');
const { get } = require('http');





const checkLog = (req, res, next) => {
  const authHeader = req.headers.cookie;
  if (authHeader) {
    const token = authHeader.split('=')[1];
    if (token) {
      jwt.verify(token, process.env.JWT_SECRT_KEY, (err, client) => {
        if (err) {
          next()
        } else {
          res.redirect(`/users`);
        }
      })
    } else {
      next()
    }
  } else {
    next()
  }

}

/* Landing Page */
router.get('/', checkLog, async function (req, res, next) {
  const products = await productModel.find().lean()
  
  res.render('Users/landingPage', { products });
});

//========================================== //

// ============ LOGOUT =====================//


router.route('/logout').get((req, res) => {
  res.cookie('userToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  }).redirect('/');
})

// =======================================//

// ============= Home page ================== ///////////
router.route('/users')
  .get(verifytokenAndAuthorization, userController.getHomepage)

//  ======================================////////

///================ABOUT===================////
router.route('/users/about')
.get(verifytokenAndAuthorization,userController.getAboutPage)

//===========================================================/////

// ======= profile =========//

router.route('/users/profile')
  .get(verifytokenAndAuthorization, userController.getProfile)
.post(verifytokenAndAuthorization,userController.editProfile)
//  ======== address ============///

router.route('/users/address')
   .get(verifytokenAndAuthorization,userController.getAllAddress)
  .post(verifytokenAndAuthorization, userController.addAddress)

router.route('/users/address/:addId')
  .get(verifytokenAndAuthorization, userController.getAaddress)
  .post(verifytokenAndAuthorization, userController.updateAaddress)
  .delete(verifytokenAndAuthorization, userController.deleteAaddress)

// ======== product ================//
router.route('/user/products/:proid')
  .get(verifytokenAndAuthorization, userController.getAproduct)

//==================== CART ======================//

router.route('/users/cart')
  .get(verifytokenAndAuthorization, userController.getCart)
  .post(verifytokenAndAuthorization, userController.postCart)


  router.route('/users/cart/:id')
  .delete(verifytokenAndAuthorization,userController.deleteCart)

//=========WISHLIST==========///
router.route('/users/wishlist')
  .get(verifytokenAndAuthorization, userController.getWishlist)
  .post(verifytokenAndAuthorization, userController.addWishlist)


  router.route('/users/wishlist/:id')
  .delete(verifytokenAndAuthorization,userController.deleteWishlist)

// =============== check Out ===========//

router.route('/users/checkout')
  .get(verifytokenAndAuthorization, userController.getCheckout)
  .post(verifytokenAndAuthorization,userController.postCheckout)

  ///====================================/////////////

  ///===================COUPON=========================////////
router.route('/users/coupon')
.post(verifytokenAndAuthorization,userController.postAcoupon)

///===========================================================///

///=========================ORDERS=============================///

router.route('/users/orders')
.get(verifytokenAndAuthorization,userController.getAllOrders)

//============================================================/////

////==================ORDER DETAILS===========================/////
router.route('/users/orderDetails/:id')
.get(verifytokenAndAuthorization,userController.getOrderDetails)

//====================CHANGE PASSWORD=============================///
router.route('/users/changePassword')
.post(verifytokenAndAuthorization,userController.changePassword)

//================================================================////
router.route('/usersVerifyOTP')
.get(userController.getOtpPage)
.post(verifytokenAndAuthorization,userController.postOtp)

//================== VERIFY PAYMENT==============================////

router.route('/verifyPaymnet')
.post(verifytokenAndAuthorization,async(req,res)=>{
  console.log(req.body)
  let body=req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;

  var crypto = require("crypto");
  var expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRETKEY)
                                  .update(body.toString())
                                  .digest('hex');
                                  console.log("sig received " ,req.body.response.razorpay_signature);
                                  console.log("sig generated " ,expectedSignature);
  var response = {"signatureIsValid":"false"}
  if(expectedSignature === req.body.response.razorpay_signature)
  await orderModel.findByIdAndUpdate(req.body.orderid,{$set:{status:'pending'}})
  await cartModel.findOneAndDelete({userId:req.user.user._id})
   response={"signatureIsValid":"true"}
      res.json(response);
  
})





module.exports = router;
