const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    otp: {
        code: { type: String, default: null },
        expiresAt: { type: Date, default: null },
    },
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);