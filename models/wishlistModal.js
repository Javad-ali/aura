const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    products:[{product:{type:mongoose.Schema.Types.ObjectId,ref:"product"}}]

}, { timestamps: true })


const wishlistModel = mongoose.model('whishlist', wishlistSchema)
module.exports = wishlistModel