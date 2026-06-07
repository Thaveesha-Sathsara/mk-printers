import { useState, useEffect } from 'react';
import API from '../utils/api';

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await API.get('/products');
                if (res.data.success) {
                    setProducts(res.data.products.filter(p => p.isAvailable));
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return {
        products,
        loading,
        error
    };
};