const Category = require('../models/category.model');

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const newCategory = new Category({ name, slug, description });
        await newCategory.save();
        
        res.status(201).json({ success: true, category: newCategory });
    } catch (error) {
        
    }
}