const Product = require('../models/product.model');

exports.createProduct = async (req, res) => {
    try {
        const { name, category, description, basePrice, requiresCustomImage, requiresCustomText, images } = req.body;

        const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newProduct = new Product({
            name, slug, category, description, basePrice, requiresCustomImage, requiresCustomText, images
        });

        await newProduct.save();
        res.status(201).json({ sucess: true, product: newProduct });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ isAvailable: true })
            .populate('category', 'name slug')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, isAvailable: true })
            .populate('category', 'name slug');
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};