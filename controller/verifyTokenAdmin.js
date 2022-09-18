const async = require('hbs/lib/async');
const jwt = require('jsonwebtoken');
const adminModel = require('../models/adminModel');

const verifytoken = (req, res, next) => {
    const authHeader = req.headers.cookie;
    if (authHeader) {
        const token = authHeader.split('=')[1];
        if (token) {
            jwt.verify(token, process.env.JWT_SECRT_KEY,async (err, client) => {
                if (err) {
                    console.log(err)
                    res.redirect('/admin');
                } else {
                    const admin = await adminModel.findById(client._id)
                    console.log(admin)
                    if(admin){
                        req.admin = client;
                        next();
                    }else{
                        res.render('admin/adminLogin');
                    }
                }
            })
        } else {
            res.redirect('/admin');
        }
    } else {
        res.redirect('/admin');
    }

}

const verifytokenAndAuthorization = (req, res, next) => {
    verifytoken(req, res, () => {
        if (req.admin.admin._id){
            next();
        } else {
            res.status(500).json({
                message: 'access denied'
            })
        }
    })
}

module.exports = verifytokenAndAuthorization