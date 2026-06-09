import React from 'react';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/ProductCard';
import { Home, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomeDecor() {
  const { products, loading, error } = useProducts();
  const decorProducts = products.filter(p => p.department === 'Home Decor');

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-sm font-medium text-gray-500">Loading collection...</div>;
  if (error) return <div className="min-h-[60vh] flex items-center justify-center text-sm font-medium text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Breadcrumbs - Essential for E-commerce */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 font-medium">
        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-900">Home Decor</span>
      </div>

      {/* Compact E-commerce Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-xl p-6 md:p-8 mb-6 text-white shadow-sm relative overflow-hidden flex items-center justify-between">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-2xl md:text-3xl font-black mb-1.5 tracking-tight">Home Decor</h1>
          <p className="text-emerald-100 text-sm md:text-base leading-relaxed">Premium customizable wall art, cushions, and interior accessories.</p>
        </div>
        {/* Faded background icon for mobile, clear on desktop */}
        <Home className="h-32 w-32 text-white/5 absolute -right-6 -bottom-6 md:relative md:right-0 md:bottom-0 md:text-emerald-500/20 md:h-20 md:w-20" />
      </div>

      {/* Mobile-Optimized Grid (2 columns on mobile) */}
      {decorProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <p className="text-sm md:text-base text-gray-500 font-medium">New decor items are arriving soon.</p>
          </div>
      ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {decorProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
              ))}
          </div>
      )}
    </div>
  );
}