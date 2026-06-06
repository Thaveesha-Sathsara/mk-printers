const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', productController.getAllProducts);
router.get('/:slug', productController.getProductBySlug);

router.post('/create', authMiddleware, productController.createProduct);
router.delete('/delete/:id', authMiddleware, productController.deleteProduct);
router.put('/update/:id', authMiddleware, productController.updateProduct);

module.exports = router;