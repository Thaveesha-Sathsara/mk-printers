const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
    },
    guestInfo: {
        name: Stirng,
        phone: String,
    },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, default: 1 },
        priceAtPurchase: { type: Number, required: true },
        customerUploadedImage: { type: String },
        customerCustomText: { type: String },
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    shippingAddress: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Printed', 'Shipped', 'Cancelled'],
        default: 'Pending',
    },
    paymentMethod: {
        type: String,
        default: 'Whatsapp Confirmation'
    },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);