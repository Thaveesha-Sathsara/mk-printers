import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/ProductCard';
import { Search, SlidersHorizontal, ChevronRight, Package } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Products() {
    const { products, loading, error } = useProducts();
    const [searchParams, setSearchParams] = useSearchParams(); 
    
    // Initialize the search bar with whatever is in the URL (e.g. ?q=mug)
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [sortBy, setSortBy] = useState('newest');

    // If the URL changes, update the local input
    useEffect(() => {
        const query = searchParams.get('q');
        if (query !== null) {
            setSearchTerm(query);
        }
    }, [searchParams]);

    // Update the URL when they type in the local search bar
    const handleLocalSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value) {
            setSearchParams({ q: value });
        } else {
            setSearchParams({});
        }
    };

    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        // search 
        if (searchTerm) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.department?.toLowerCase().includes(searchTerm.toLowerCase()) // Added department search support!
            );
        }

        // sort
        if (sortBy === 'price-low') result.sort((a, b) => a.basePrice - b.basePrice);
        if (sortBy === 'price-high') result.sort((a, b) => b.basePrice - a.basePrice);

        return result;
    }, [products, searchTerm, sortBy]);

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-sm font-medium text-gray-500">Loading catalog...</div>;
    if (error) return <div className="min-h-[60vh] flex items-center justify-center text-sm font-medium text-red-500">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Helmet>
                <title>Shop Products | M.K. Printers</title>
                <meta name="description" content="Explore our wide range of customizable products at M.K. Printers. From magic mugs to personalized apparel, find the perfect item to express your unique style or create unforgettable gifts. Shop now and bring your ideas to life!" />
                <meta name="keywords" content="custom products, magic mugs, personalized apparel, custom printing, unique gifts, M.K. Printers" />
            </Helmet>

            {/* Breadcrumbs - Essential for E-commerce */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 font-medium">
                <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gray-900">All Products</span>
            </div>

            {/* Compact E-commerce Banner */}
            {/* <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 md:p-8 mb-6 text-white shadow-sm relative overflow-hidden flex items-center justify-between">
                <div className="relative z-10 max-w-xl">
                    <h1 className="text-2xl md:text-3xl font-black mb-1.5 tracking-tight">All Products</h1>
                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">Explore our complete catalog of customizable items and premium prints.</p>
                </div>
                <Package className="h-32 w-32 text-white/5 absolute -right-6 -bottom-6 md:relative md:right-0 md:bottom-0 md:text-gray-500/20 md:h-20 md:w-20" />
            </div> */}

            {/* Search and Sort Sticky/Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search mugs, apparel, categories..."
                        value={searchTerm}
                        onChange={handleLocalSearchChange}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm text-sm"
                    />
                </div>

                <div className="relative md:w-56">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SlidersHorizontal className="text-gray-400 h-4 w-4" />
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm appearance-none cursor-pointer text-sm font-medium text-gray-700"
                    >
                        <option value="newest">Newest Arrivals</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {/* Mobile-Optimized Grid (2 columns on mobile) */}
            {filteredAndSortedProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <p className="text-sm md:text-base text-gray-500 font-medium">No products found matching your search.</p>
                    <button aria-label="Clear search" onClick={() => { setSearchTerm(''); setSearchParams({}); }} className="mt-4 text-blue-600 font-bold hover:underline text-sm">Clear Search</button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                    {filteredAndSortedProducts.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}