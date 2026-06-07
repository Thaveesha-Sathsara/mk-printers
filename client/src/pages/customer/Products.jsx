import { useState, useMemo } from 'react';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/ProductCard';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function Products() {
    const { products, loading, error } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        // search 
        if (searchTerm) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // sort
        if (sortBy === 'price-low') result.sort((a, b) => a.basePrice - b.basePrice);
        if (sortBy === 'price-high') result.sort((a, b) => b.basePrice - a.basePrice);

        return result;
    }, [products, searchTerm, sortBy]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading catalog...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-12 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Shop All Products</h1>
                <p className="text-xl text-gray-500">Find the perfect customizable item for your needs.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search mugs, shirts, categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                    />
                </div>

                <div className="relative md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SlidersHorizontal className="text-gray-400 h-5 w-5" />
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full pl-12 pr-10 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm appearance-none cursor-pointer"
                    >
                        <option value="newest">Newest Arrivals</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {filteredAndSortedProducts.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xl text-gray-500 font-medium">No products found matching your search.</p>
                    <button onClick={() => setSearchTerm('')} className="mt-4 text-blue-600 font-bold hover:underline">Clear Search</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredAndSortedProducts.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}