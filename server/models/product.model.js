const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Category',
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    basePrice: {
        type: Number,
        required: true,
    },
    images: [{ type: String }],
    model3dUrl: {
        type: String,
        default: '',
    },
    requiresCustomImage: {
        type: Boolean,
        default: false,
    },
    requiresCustomText: {
        type: Boolean,
        default: false,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    overLayUrl: {
        type: String,
        default: '',
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);