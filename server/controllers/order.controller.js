const Order = require('../models/order.model');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.createOrder = async (req, res) => {
    try {
        const { items, totalAmount } = req.body;

        let userId = null;
        if (req.user && req.user.id) userId = req.user.id;
        else if (req.user && req.user._id) userId = req.user._id;
        else if (req.userId) userId = req.userId;
        else if (typeof req.user === 'string') userId = req.user;

        if (!userId) {
            console.log("CRASH REASON: Could not extract User ID from the request.");
            return res.status(401).json({ success: false, message: "User authentication failed. No ID found." });
        }

        const processedItems = await Promise.all(items.map(async (item) => {
            let uploadedCustomImageUrl = '';

            if (item.customImage && item.customImage.startsWith('data:image')) {
                const uploadRes = await cloudinary.uploader.upload(item.customImage, {
                    folder: 'mk_printers/orders/custom_images',
                });
                uploadedCustomImageUrl = uploadRes.secure_url;
            } else {
                uploadedCustomImageUrl = item.customImage || '';
            }

            return {
                product: item._id || item.productId,
                name: item.name,
                quantity: Number(item.quantity) || 1,
                price: Number(item.basePrice) || 0,
                customText: item.customText || '',
                customImage: uploadedCustomImageUrl
            };
        }));

        const cleanTotalAmount = Number(totalAmount.toString().replace(/[^0-9.-]+/g,""));

        const newOrder = new Order({
            user: userId,
            items: processedItems,
            totalAmount: cleanTotalAmount
        });

        await newOrder.save();

        res.status(201).json({
            success: true,
            orderId: newOrder._id,
            message: 'Order secured in database.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.userId;
        
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("My Orders Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("All Orders Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId).populate('items.product');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const userId = req.user?.id || req.user?._id || req.userId;
        if (order.user.toString() !== userid.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Get Order By ID Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};