"use strict";
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function sendOTP(email, otp) {

        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testings t
        // let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        const transporter =   nodemailer.createTransport({
            host:  process.env.MAIL_HOST,
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: `"Sopping Auth" ${process.env.MAIL_USER}`, // sender address
            to: `${email}`, // list of receivers
            subject: "OTP", // Subject line
            html: `<h3> your OTP is <span style="background-color:blue;color:white;font-size:25px;padding:10px;margin-left:25px">${otp}</span> </h3> <div style="color: gray;font-size:18px"> note: this OTP is only valid for 10 Minutes </div>`, // html body
        });
        return info.messageId

}


module.exports = sendOTP;