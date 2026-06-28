const Product = require('../models/product.model');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadBase64 = async (base64Str, folder) => {
    if (!base64Str || !base64Str.startsWith('data:image')) return '';
    try {
        const res = await cloudinary.uploader.upload(base64Str, { folder });
        return res.secure_url;
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        return '';
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { 
            name, category, department, description, basePrice, 
            requiresCustomImage, requiresCustomText, 
            mainImagesBase64, // Now an array of base64 strings
            model3Base64, overlayBase64,
            colors, sizes, customVariants // The new variant arrays
        } = req.body;
        
        // 1. Upload Main Images
        const uploadedImages = [];
        if (mainImagesBase64 && mainImagesBase64.length > 0) {
            for (const img of mainImagesBase64) {
                const url = await uploadBase64(img, 'mk_printers/products/main');
                if (url) uploadedImages.push(url);
            }
        }

        // 2. Upload Model & Overlay
        let uploadedModelUrl = '';
        if (model3Base64) {
            const modelUploadRes = await cloudinary.uploader.upload(model3Base64, { folder: 'mk_printers/products/models', resource_type: 'auto' });
            uploadedModelUrl = modelUploadRes.secure_url;
        }
        const uploadedOverlayUrl = await uploadBase64(overlayBase64, 'mk_printers/products/overlays');

        // 3. Process Variants & Upload Variant Images
        const processVariants = async (variantsArray) => {
            if (!variantsArray) return [];
            return await Promise.all(variantsArray.map(async (v) => {
                const imgUrl = await uploadBase64(v.imageBase64, 'mk_printers/products/variants');
                return { value: v.value, price: v.price || null, image: imgUrl };
            }));
        };

        const processedColors = await processVariants(colors);
        const processedSizes = await processVariants(sizes);
        
        const processedCustomVariants = [];
        if (customVariants && customVariants.length > 0) {
            for (const cv of customVariants) {
                const processedOptions = await processVariants(cv.options);
                processedCustomVariants.push({ title: cv.title, options: processedOptions });
            }
        }
        
        // 4. Generate Slug and Save
        const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newProduct = new Product({
            name, slug, category, department, description, basePrice, 
            requiresCustomImage, requiresCustomText,
            images: uploadedImages,
            model3dUrl: uploadedModelUrl,
            overLayUrl: uploadedOverlayUrl,
            colors: processedColors,
            sizes: processedSizes,
            customVariants: processedCustomVariants
        });
        
        await newProduct.save();
        res.status(201).json({ success: true, product: newProduct });
    } catch (error) {
        console.error("Create Product Crash:", error);
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
        const { 
            name, category, department, description, basePrice, 
            requiresCustomImage, requiresCustomText, 
            mainImagesBase64, model3Base64, overlayBase64,
            colors, sizes, customVariants
        } = req.body;

        const updates = { name, category, department, description, basePrice, requiresCustomImage, requiresCustomText };

        // 1. Process Main Images (Keep existing URLs, upload new Base64s)
        const processedImages = [];
        if (mainImagesBase64 && mainImagesBase64.length > 0) {
            for (const img of mainImagesBase64) {
                if (img.startsWith('data:image')) {
                    const url = await uploadBase64(img, 'mk_printers/products/main');
                    if (url) processedImages.push(url);
                } else {
                    processedImages.push(img); // It's an existing Cloudinary URL
                }
            }
            updates.images = processedImages;
        }

        // 2. Process Model & Overlay
        if (model3Base64 && model3Base64.startsWith('data:')) {
            const modelUploadRes = await cloudinary.uploader.upload(model3Base64, { folder: 'mk_printers/products/models', resource_type: 'auto' });
            updates.model3dUrl = modelUploadRes.secure_url;
        }
        if (overlayBase64 && overlayBase64.startsWith('data:')) {
            updates.overLayUrl = await uploadBase64(overlayBase64, 'mk_printers/products/overlays');
        }

        // 3. Process Variants
        const processVariants = async (variantsArray) => {
            if (!variantsArray) return [];
            return await Promise.all(variantsArray.map(async (v) => {
                let imgUrl = v.image || ''; // Keep existing image if present
                if (v.imageBase64 && v.imageBase64.startsWith('data:image')) {
                    imgUrl = await uploadBase64(v.imageBase64, 'mk_printers/products/variants');
                }
                return { value: v.value, price: v.price || null, image: imgUrl };
            }));
        };

        if (colors) updates.colors = await processVariants(colors);
        if (sizes) updates.sizes = await processVariants(sizes);

        if (customVariants) {
            const processedCustomVariants = [];
            for (const cv of customVariants) {
                const processedOptions = await processVariants(cv.options);
                processedCustomVariants.push({ title: cv.title, options: processedOptions });
            }
            updates.customVariants = processedCustomVariants;
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, { returnDocument: 'after' });
        res.status(200).json({ success: true, product: updatedProduct });
    } catch (error) {
        console.error("Update Product Crash:", error);
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
