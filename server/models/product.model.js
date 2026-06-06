const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        reuqired: true,
    },
    slug: {
        type: String,
        reuqired: true,
        unique: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Category',
        reuqired: true,
    },
    description: {
        type: String,
        required: true,
    },
    basePrice: {
        type: Number,
        reuqired: true,
    },
    images: [{ type: String }],
    requiresCustomImage: {
        type: Boolean,
        default: false,
    },
    requiresCustomtext: {
        type: Boolean,
        defailt: false,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);