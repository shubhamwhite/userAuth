const router = require('express').Router();
const {signup, verifyOtp, resendOtpOrForgotPassword, login, resetPassword, logout, getUser, updateUser} = require('../controllers/auth.controller');
const { upload } = require('../helper/imageUpload.helper');
const authMiddleware = require('../middleware/auth.middleware');
const errorHandler = require('../middleware/errorHandler.middleware');
const signupValidationSchema = require('../validation/auth.validation');

router.route('/signup').post(upload.single('profile_image'), signupValidationSchema, signup);
router.route('/verify-otp').post(verifyOtp);
router.route('/password-reset/otp/resend').post(resendOtpOrForgotPassword);
router.route('/login').post(login);
router.route('/password-reset').post(resetPassword);
router.route('/logout').get(logout);
router.route('/user/:id').get(authMiddleware, getUser);
router.route('/user/update/:id').patch(authMiddleware, upload.single('profile_image'), updateUser);

router.use(errorHandler)

module.exports = router;