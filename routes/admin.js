var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const adminModel = require('../models/adminModel');
const userModel = require('../models/userModel');
const couponModel = require('../models/couponModel');
const adminController =require('../controller/adminController');
const verifytokenAndAuthorization = require('../controller/verifyTokenAdmin')

const bcrypt =require('bcrypt');
const jwt = require('jsonwebtoken')



const checkLog = (req, res, next) => {
  const authHeader = req.headers.cookie;
  if (authHeader) {
    const token1 = authHeader.split('jwt=')[1];
    const token =token1.split(';')[0]
      if (token) {
          jwt.verify(token, process.env.JWT_SECRT_KEY, (err, client) => {
            // console.log(client)
              if (err) {
                  next()
              } else {
                  res.redirect(`/admin/home`);
              }
          })
      } else {
          next()
      }
  } else {
      next()
  }

}

const multer =require('multer');
const { Router } = require('express');

const storage = multer.diskStorage({
  destination: "public/images/items",
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const uploads = multer({
  storage,
}).single("image");


const banner = multer.diskStorage({
  destination: "public/images/banner",
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const uploads2 = multer({
  storage,
}).single("image");


/* GET home page. */
router.route('/')
.get(checkLog,adminController.getLoginPage)
.post(adminController.postLogin);

// ========= HOME ==========///
router.route('/home').get(verifytokenAndAuthorization,adminController.getHomePage);

///////////////////////////////


// ========= PRODUCT ====== ///

router.route('/products')
.get(verifytokenAndAuthorization,adminController.getAllProducts)
.post(uploads,adminController.addProduct)
.delete(adminController.deleteProduct)

router.route('/products/:id')
.get(verifytokenAndAuthorization,adminController.getAProduct)
.post(adminController.editProduct)

///////////////////////////////
//============ CATEGORY =======//
router.route('/categorys')
.get(verifytokenAndAuthorization,adminController.getAllCategory)
.post(uploads,adminController.addCategory)

router.route('/categorys/:id')
.get(verifytokenAndAuthorization,adminController.getACategory)
.post(adminController.editCategory)
.patch(adminController.addSubCategory)
.delete(adminController.deleteCategory)


//==========================/////

//==========ORDERS==========////
router.route('/orders')
.get(verifytokenAndAuthorization,adminController.getAllOrders)

// .post(verifytokenAndAuthorization,adminController.edit)

//===========COUPON========////
router.route('/coupon')
.get(verifytokenAndAuthorization,adminController.getAllCoupon)
.post(adminController.addCoupon)

router.route('/coupon/:couponId')
.get(verifytokenAndAuthorization,adminController.getAcoupon)
.post(adminController.editCoupon)
.delete(adminController.deleteCoupon)

//===========BANNER================///
router.route('/banner')
.get(verifytokenAndAuthorization,adminController.getAllBanner)
.post(uploads2,adminController.addBanner)

router.route('/banner/:bannerId')
.get(verifytokenAndAuthorization,adminController.getABanner)
.delete(adminController.deleteBanner)
///=======================================///

///============STATUS======================///
router.route('/status')
.post(verifytokenAndAuthorization,adminController.postStatus)

//========================================================///

//================CANCEL ORDER=============================////
router.route('/cancelOrder')
.post(verifytokenAndAuthorization,adminController.cancelOrder)

// ========== USER ========= ///

router.route('/users')
.get(verifytokenAndAuthorization,adminController.getUserData)
.patch(adminController.blockUser)
.post(adminController.unblockUser)

////////////////////////////////


router.route('/logout').get((req,res)=>{
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
}).redirect('/admin');
})
//==============================================//

module.exports = router;


