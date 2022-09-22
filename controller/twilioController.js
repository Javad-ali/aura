const twilio = require('twilio')
const dotenv = require('dotenv')
dotenv.config({path:'./.env'})

const config =process.env.config

const ServiceSID = process.env.ServiceSID
const accountSid = process.env.AccountSID;
const authToken = process.env.AuthToken;
const client = require('twilio')(accountSid, authToken,ServiceSID);

module.exports ={
    signupotp:(number)=>{
        return new Promise((resolve,reject)=>{
            client.verify.v2.services(ServiceSID).verifications.create({
                to:'+91' +number,
                channel:'sms'
            }).then(data=>{
                resolve(data)
            })
        })
    },
}