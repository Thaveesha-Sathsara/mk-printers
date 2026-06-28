const mongoose = require('mongoose');

const variantOptionSchema = new mongoose.Schema({
    value: { type: String, required: true }, 
    price: { type: Number },
    image: { type: String, default: '' },
});

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
    colors: [variantOptionSchema],
    sizes: [variantOptionSchema],
    customVariants: [{
        title: { type: String, required: true },
        options: [variantOptionSchema],
    }],
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
    },
    printZone: {
        x: { type: Number, default: 0.2 },
        y: { type: Number, default: 0.25 },
        width: { type: Number, default: 0.6 },
        height: { type: Number, default: 0.5 },
    },
    department: {
        type: String,
        enum: ['General', 'Home Decor', 'Business Essentials'],
        default: 'General',
    },
    
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);