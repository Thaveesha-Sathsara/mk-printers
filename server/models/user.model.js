const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    googleId: {
        type: String
    },
    phone: {
        type: String,
    },
    address: {
        street: String,
        city: String,
        postalCode: String,
    },

    savedDesigns: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'Product'
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);