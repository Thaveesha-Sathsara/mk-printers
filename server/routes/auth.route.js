const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/login-admin', authController.login);
router.post('/request-otp', authController.requestOtp);
router.post('/reset-password', authController.resetPassword);
router.post('/login', authController.loginUser);
router.post('/register', authController.registerUser);

module.exports = router;