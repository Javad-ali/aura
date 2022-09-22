var express = require('express');
var router = express.Router();
const userModel =require('../models/userModel');
const bcrypt =require('bcrypt');
const jwt = require('jsonwebtoken')

const { Router } = require('express');
const productModel =require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const async = require('hbs/lib/async');
const cartModel = require('../models/cartModel');
const addressModel = require('../models/addressModel')
const { findOne } = require('../models/userModel');
const verifytokenAndAuthorization = require('../controller/verifyToken');
const bannerModel = require('../models/bannerModel');





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
router.get('/',checkLog,async function(req, res, next) {
  const products=await  productModel.find().lean()
  res.render('Users/landingPage',{products});
});

//========================================== //

// ============ LOGOUT =====================//


router.route('/logout').get((req,res)=>{
  res.cookie('userToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
}).redirect('/');
})



// =======================================//




// ============= Home page ================== ///////////
router.route('/users').get(verifytokenAndAuthorization,async(req,res)=>{
  // console.log(req.user.user._id);
  const user =await userModel.findById(req.user.user._id,{password:0}).lean()
  
  const products=await productModel.find().populate('category').lean()
  const cart = await cartModel.findOne({userId:req.user.user._id}).lean().populate({path:'products',populate:'product'})
  const category= await categoryModel.find().lean()
  const banner= await bannerModel.find().lean()
  res.render('Users/usersHome',{products,category,user,cart,banner})
})
//  ======================================////////

// ======= profile =========//

router.route('/users/address').get(verifytokenAndAuthorization,async(req,res)=>{
  const address = await addressModel.findOne({userId:req.user.user._id}).lean()
  res.render('Users/profile/address',{layout:'profilelayout',address})
})

//  ======== address ============///

router.route('/users/address').post( verifytokenAndAuthorization,async(req,res)=>{
  const oldAddress =await addressModel.findOne({userId:req.user.user._id})
  const addresses = {
    address:req.body.address,
    state:req.body.state,
    city:req.body.city,
    pin:req.body.pin,
    contact:req.body.contact
  }
  if(oldAddress){
    await addressModel.findByIdAndUpdate(oldAddress._id,{$push:{addresses}})
    res.redirect(`/users/checkOut`);

  }else{
    const newAddress = await new addressModel({userId:req.user.user._id,addresses})
    newAddress.save() 
   
    res.redirect(`/users/checkOut`);

  }
})
router.route('/users/address/:addId').get( verifytokenAndAuthorization,async(req,res)=>{
  const ALLaddress = await addressModel.findOne({userId:req.user.user._id})
  const address = ALLaddress.addresses.filter(e=>e._id == req.params.addId)
  res.json({address})

}).post(async(req,res)=>{
const address =await addressModel.updateOne({'addresses._id':req.params.addId},{$set:{'addresses.$':req.body}})
res.redirect(`/users/address`)
}).delete(async(req,res)=>{
  const address = await addressModel.findOneAndUpdate({userId:req.user.user._id},{$pull:{addresses:{_id:req.params.addId}}})
  console.log(address)
  res.json({status:"success"})
})





// ======== product ================//
router.route('/user/products/:proid').get( verifytokenAndAuthorization,async(req,res)=>{
  const product= await productModel.findById(req.params.proid);
  res.json({product})
})

//==================== CART ======================//

router.route('/users/cart')
.get( verifytokenAndAuthorization,async(req,res)=>{
  const cart= await cartModel.findOne({userId:req.user.user._id}).populate({path:'products',populate:{path:'product'}}).lean()
const user= await userModel.findById(req.user.user._id).lean()
const category= await categoryModel.find().lean()

  res.render('Users/cart',{cart,user,category})
})

  .post( verifytokenAndAuthorization, async(req,res)=>{
    const discountPrice = await productModel.findById(req.body.prodId,{product:{discountPrice:1}})
    const totalPrice= (discountPrice.product.discountPrice*1)*req.body.qty
    const oldCart =await cartModel.findOne({userId:req.user.user._id})
    if(oldCart){
const finalPrice= oldCart.products.reduce((acc,crr)=>{
  return acc+crr.price
},0)
      const oldProduct= await cartModel.findOne({'products.product':req.body.prodId})

      if(oldProduct){
        if(oldProduct.qty== 1 && req.body.qty== -1){
          console.log('pull');
          await cartModel.updateOne({'products.product':req.body.prodId},{"$pull":{'products.$.product':req.body.prodId}})
        }
        const cart= await cartModel.updateOne({'products.product':req.body.prodId},{'$inc':{'products.$.qty':req.body.qty,'products.$.price':totalPrice}})
        await cartModel.findByIdAndUpdate(oldCart._id,{$inc:{totalPrice}})
        console.log(cart)
      

      }else{
        console.log("else case")
        const products={
            product:req.body.prodId,
            qty:req.body.qty,
          price:totalPrice}
          const cart = await cartModel.findByIdAndUpdate(oldCart._id,{$push:{products:products},$inc:{totalPrice}})
        }
    }else{
      const products={
        product:req.body.prodId,
        qty:req.body.qty,
      price:totalPrice}

      const cart = await new cartModel({userId:req.user.user._id,products,totalPrice})
      cart.save()
      console.log(cart)
    }
      res.json({status:"success"})
  })
// =============== check Out ===========//

router.route('/users/checkout').get(verifytokenAndAuthorization,async(req,res)=>{
  const cart= await cartModel.findOne({userId:req.user.user._id}).populate({path:'products',populate:{path:'product'}}).lean()
  const user= await userModel.findById(req.user.user._id).lean()
  const category= await categoryModel.find().lean()

    res.render('Users/checkOut',{cart,user,category})
})



module.exports = router;
