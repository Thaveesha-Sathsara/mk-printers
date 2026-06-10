const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/login-admin', authController.login);
router.post('/request-otp', authController.requestOtp);
router.post('/reset-password', authController.resetPassword);
router.post('/login', authController.loginUser);
router.post('/register', authController.registerUser);
router.post('/google', authController.googleLogin);
router.put('/update-profile', authMiddleware, authController.updateProfile);

module.exports = router;