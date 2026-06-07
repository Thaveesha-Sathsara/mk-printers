import { Link } from 'react-router-dom';
import { ArrowRight, PaintBucket } from 'lucide-react';

export default function ProductCard({ product }) {
    return (
        <Link to={`/product/${product.slug}`} className="bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col overflow-hidden">
            <div className="relative aspect-square overflow-hidden bg-gray-50">
                <img
                    src={product.images?.[0] || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.requiresCustomImage && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-600 flex items-center gap-1 shadow-sm">
                        <PaintBucket className="h-3 w-3" /> Customizable
                    </span>
                )}
            </div>

            <div className="p-5 flex flex-col flex-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {product.category?.name || 'Category'}
                </span>
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{product.name}</h3>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                    <span className="text-xl font-black text-gray-900">Rs. {product.basePrice}</span>
                    <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <ArrowRight className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </Link>
    );
}