const async = require('hbs/lib/async');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const verifytoken = (req, res, next) => {

    const authHeader = req.headers?.cookie;
    if (authHeader) {
        const token1 = authHeader?.split('userToken=')[1];
        const token =token1?.split(';')[0]
        if (token) {
            jwt.verify(token, process.env.JWT_SECRT_KEY, (err, client) => {
                if (err) {
                    console.log(err)
                    res.redirect('/login');
                } else {
                    req.user = client;
                    next();
                }
            })
        } else {
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }

}

const verifytokenAndAuthorization = (req, res, next) => {
    verifytoken(req, res, async () => {
       if(req?.user?.user?._id){
        next()
       }else{
        redirect('/login')
       }
    })
}

module.exports = verifytokenAndAuthorization