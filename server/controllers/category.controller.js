const Category = require('../models/category.model');

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const newCategory = new Category({ name, slug, description });
        await newCategory.save();
        
        res.status(201).json({ success: true, category: newCategory });
    } catch (error) {
        if (error) {
            return res.status(400).json({ success: false, message: 'Category already exists' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};