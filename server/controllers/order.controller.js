const Order = require('../models/order.model');
const cloudinary = require('../config/cloudinary.config');

exports.createOrder = async (req, res) => {
    try {
        const { items, totalAmount } = req.body;
        const userId = req.user.id;

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
                product: item.productId,
                name: item.name,
                quantity: item.quantity,
                price: item.basePrice,
                customText: item.customText || '',
                customImage: uploadedCustomImageUrl
            };
        }));

        const newOrder = new Order({
            user: userId,
            items: processedItems,
            totalAmount
        });

        await newOrder.save();

        res.status(201).json({
            success: true,
            orderId: newOrder._id,
            message: 'Order secured in database.'
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};