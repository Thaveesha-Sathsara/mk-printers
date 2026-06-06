const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', productController.getAllProducts);
router.get('/:slug', productController.getProductBySlug);

rputer.post('/create', authMiddleware, productController.createProduct);

module.exports = router;