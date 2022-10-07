const async = require('hbs/lib/async');
const jwt = require('jsonwebtoken');
const adminModel = require('../models/adminModel');

const verifytoken = (req, res, next) => {
    const authHeader = req?.headers?.cookie;
    if (authHeader) {
        console.log(authHeader);
        const token1 = authHeader?.split('jwt=')[1];
        const token =token1?.split(';')[0]
        if (token) {
            jwt.verify(token, process.env.JWT_SECRT_KEY, async (err, client) => {
                if (err) {
                    console.log(err)
                    res.redirect('/admin');
                } else {
                    console.log(client);
                    const admin = await adminModel.findById(client.admin._id)
                   
                    if (admin) {
                        req.admin = client;
                        next();
                    } else {
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
    
        if (req.admin.admin._id) {
            next();
        } else {
            res.status(500).json({
                message: 'access denied'
            })
        }
    })
}

module.exports = verifytokenAndAuthorization