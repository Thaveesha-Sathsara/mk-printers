import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import ProductCard from '../../components/ProductCard'; // Use the component I gave you earlier

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get('/products');
        if (res.data.success) setProducts(res.data.products);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  // Filter products based on search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black mb-8">All Products</h1>
      
      {/* SEARCH BAR */}
      <input 
        type="text" 
        placeholder="Search for products..." 
        className="w-full md:w-96 p-4 mb-8 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? <p>Loading...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}