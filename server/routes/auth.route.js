const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/login', authController.login);
router.post('/request-otp', authController.requestOtp);
router.post('/reset-password', authController.resetPassword);

module.exports = router;