const async = require('hbs/lib/async');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const verifytoken = (req, res, next) => {

    const authHeader = req.headers.cookie;
    if (authHeader) {
        const token = authHeader.split('=')[1];
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
        console.log(req.user)
        if (req.user.user) {
            const user = await userModel.findById(req.user.user._id)
            if (user) {
                next();
            }
            else {
                res.status(500).json({
                    message: 'access denied'
                })
            }
        } else if (req.user.admin) {
            next()
        } else {
            res.status(500).json({
                message: 'access denied'
            })

        }
    })
}

module.exports = verifytokenAndAuthorization