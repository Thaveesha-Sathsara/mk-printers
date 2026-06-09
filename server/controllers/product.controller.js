const Product = require('../models/product.model');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 1. ADMIN: Add a new product to the store
exports.createProduct = async (req, res) => {
    try {
        const { name, category, department, description, basePrice, requiresCustomImage, requiresCustomText, imageBase64, model3Base64, overlayBase64 } = req.body;
        
        let uploadedImageUrl = '';
        let uploadedModelUrl = '';
        let uploadedOverlayUrl = '';

        if (imageBase64) {
            const uploadRes = await cloudinary.uploader.upload(imageBase64, { folder: 'mk_printers/products' });
            uploadedImageUrl = uploadRes.secure_url;
        }

        if (model3Base64) {
            const modelUploadRes = await cloudinary.uploader.upload(model3Base64, {
                folder: 'mk_printers/products/models',
                resource_type: 'auto'
            });
            uploadedModelUrl = modelUploadRes.secure_url;
        }

        if (overlayBase64) {
            const overlayUploadRes = await cloudinary.uploader.upload(overlayBase64, {
                folder: 'mk_printers/products/overlays',
            });
            uploadedOverlayUrl = overlayUploadRes.secure_url;
        }
        
        const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newProduct = new Product({
            name, slug, category, department, description, basePrice, requiresCustomImage, requiresCustomText,
            images: uploadedImageUrl ? [uploadedImageUrl] : [],
            model3dUrl: uploadedModelUrl,
            overLayUrl: uploadedOverlayUrl,
        });
        
        await newProduct.save();
        res.status(201).json({ success: true, product: newProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category', 'name slug')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { imageBase64, overlayBase64, ...updates } = req.body;

        if (imageBase64) {
            const uploadRes = await cloudinary.uploader.upload(imageBase64, { folder: 'mk_printers/products' });
            updates.images = [uploadRes.secure_url];
        }

        if (overlayBase64) {
            const overlayUploadRes = await cloudinary.uploader.upload(overlayBase64, {
                folder: 'mk_printers/products/overlays',
            });
            updates.overLayUrl = overlayUploadRes.secure_url;
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
        res.status(200).json({ success: true, product: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, isAvailable: true }).populate('category', 'name slug');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
