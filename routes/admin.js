var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const adminModel = require('../models/adminModel');
const userModel = require('../models/userModel');
const adminController =require('../controller/adminController');
const verifytokenAndAuthorization = require('../controller/verifyTokenAdmin')

const bcrypt =require('bcrypt');
const jwt = require('jsonwebtoken')



const checkLog = (req, res, next) => {
  const authHeader = req.headers.cookie;
  if (authHeader) {
      const token = authHeader.split('=')[1];
      if (token) {
          jwt.verify(token, process.env.JWT_SECRT_KEY, (err, client) => {
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

const storage = multer.diskStorage({
  destination: "public/images/items",
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const uploads = multer({
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


module.exports = router;


