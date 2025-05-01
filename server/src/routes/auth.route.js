const router = require('express').Router();
const {signup, verifyOtp, resendOtpOrForgotPassword, login, resetPassword, logout, getUser} = require('../controllers/auth.controller');
const upload = require('../helper/imageUpload.helper');
const authMiddleware = require('../middleware/auth.middleware');
const errorHandler = require('../middleware/errorHandler.middleware');

router.route('/signup').post(upload.single('profile_image'), signup);
router.route('/verify-otp').post(verifyOtp);
router.route('/password-reset/otp/resend').post(resendOtpOrForgotPassword);
router.route('/login').post(login);
router.route('/password-reset').post(resetPassword);
router.route('/logout').get(logout);
router.route('/user/:id').get(authMiddleware, getUser);

router.use(errorHandler)

module.exports = router;