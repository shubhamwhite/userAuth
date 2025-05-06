const nodeMailer = require('nodemailer')
const config = require('../config')
const path = require('path')
const ejs = require('ejs')
const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.get('EMAIL_USER'),
        pass: config.get('EMAIL_PASSWORD'),
    },
})

const sendOtpToEmail = async (email, otp, name, flag = 'verify') => {
    try {
        let templatePath
        let subject

        switch (flag) {
        case 'forgot_password':
            templatePath = path.join(__dirname, '../views/passwordResetOtp.ejs')
            subject = 'Reset Your Password'
            break
        case 'resend_otp':
            templatePath = path.join(__dirname, '../views/reSendOtp.ejs')
            subject = 'Resend OTP for Verification'
            break
        case 'verify':
        default:
            templatePath = path.join(__dirname, '../views/emailOtp.ejs')
            subject = 'Your Email Verification OTP'
            break
        }

        const html = await ejs.renderFile(templatePath, { otp, name })

        const info = await transporter.sendMail({
            from: config.get('EMAIL_USER'),
            to: email,
            subject,
            text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
            html,
        })

        console.log('Message sent: %s', info.messageId)
        return info
    } catch (error) {
        console.error('Error sending email:', error.message)
        throw new Error('Failed to send email')
    }
}

module.exports = sendOtpToEmail
