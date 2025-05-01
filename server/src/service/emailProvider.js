const nodeMailer = require('nodemailer');
const config = require('../config');
const path = require('path');
const ejs = require('ejs');
const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.get('EMAIL_USER'),
        pass: config.get('EMAIL_PASSWORD'),
    },
});

const sendOtpToEmail = async (email, otp) => {
    try {
        const emailTemplatePath = path.join(__dirname, '../views/emailOtp.ejs');
        const html = await ejs.renderFile(emailTemplatePath, { otp });
        
        const info = await transporter.sendMail({
            from: config.get('EMAIL_USER'),
            to: email,
            subject: 'Your email verification OTP',
            text: `Your email verification code is ${otp}. It will expire in 10 minutes.`,
            html: html
        });
        
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw new Error('Failed to send email');
    }
}

module.exports = sendOtpToEmail;