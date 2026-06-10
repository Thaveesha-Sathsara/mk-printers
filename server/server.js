require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const giftRoutes = require('./routes/gift.route');
const authRoutes = require('./routes/auth.route');
const categoryRoutes = require('./routes/category.route');
const productRoutes = require('./routes/product.route');
const orderRoutes = require('./routes/order.route');

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use('/api/gift', giftRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.send('Gift box API is running.');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});