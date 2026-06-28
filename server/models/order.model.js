const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            name: { type: String, required: true },
            quantity: { type: Number, required: true, default: 1 },
            price: { type: Number, required: true },
            image: { type: String, default: '' },
            variant: { type: Object, default: {} },
            customText: { type: String, default: '' },
            customImage: { type: String, default: '' }
        }
    ],
    totalAmount: { 
        type: Number, 
        required: true 
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Printing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);