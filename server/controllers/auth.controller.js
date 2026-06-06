const Admin = require('../models/admin.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// admin login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });

        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(404).json({ success: false, message: 'Invalid credentials' });

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ success: true, token, username: admin.username });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.requestOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) return res.status(400).json({ success: false, message: 'Email not found' });

        // generate a 6 digit otp
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000);

        admin.otp = { code: otpCode, expiresAt };
        await admin.save();

        // nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: admin.email,
            subject: 'Admin Dahsboard - Password Reset OTP',
            text: `Your OTP Code is ${otpCode}. It expires in 10 minutes.`
        });

        res.status(200).json({ success: true, message: 'OTP sent to email' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// verfiy otp and change password
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin || admin.otp.code !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        if (new Date() > new Date(admin.otp.expiresAt)) {
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        // hash the new password
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(newPassword, salt);
        admin.otp = { code: null, expiresAt: null };
        await admin.save();

        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};