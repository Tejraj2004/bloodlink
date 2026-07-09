const router = require('express').Router();
const {
  register, verifyOTP, resendOTP, login, googleAuth,
  refreshToken, logout, getMe, forgotPassword, resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register',       register);
router.post('/verify-otp',     verifyOTP);
router.post('/resend-otp',     resendOTP);
router.post('/login',          login);
router.post('/google',         googleAuth);
router.post('/refresh-token',  refreshToken);
router.post('/forgot-password',forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout',         protect, logout);
router.get('/me',              protect, getMe);

module.exports = router;
