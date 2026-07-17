import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Image as ImageIcon } from 'lucide-react';

export default function ProductCard({ product }) {
    // check if the product has a standard image array
    const imageUrl = product.images && product.images.length > 0 
        ? product.images[0] 
        : null;

    return (
        <Link 
            to={`/product/${product.slug}`} 
            className="group block bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 overflow-hidden"
        >
            <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                
                {/* thumbnail image */}
                {imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon className="h-12 w-12 mb-2 opacity-30" />
                        <span className="text-xs font-medium uppercase tracking-wider">No Thumbnail</span>
                    </div>
                )}

                {/* 2. THE 3D BADGE (Only shows if the product has a 3D model attached) */}
                {product.model3dUrl && (
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-gray-200">
                        <Box className="h-4 w-4 text-blue-600" />
                        <span className="text-[10px] font-black text-gray-800 tracking-wider uppercase">3D Custom</span>
                    </div>
                )}
            </div>

            {/* PRODUCT DETAILS */}
            <div className="p-5">
                <div className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-2">
                    {product.category?.name || 'Uncategorized'}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                    {product.name}
                </h3>
                <div className="text-xl font-black text-gray-900">
                    Rs. {product.basePrice}
                </div>
            </div>
        </Link>
    );
}