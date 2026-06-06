import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.slug}`} className="bg-white p-4 rounded-2xl border border-gray-100 hover:shadow-xl transition-all group">
      <div className="aspect-square overflow-hidden rounded-xl mb-4 bg-gray-100">
        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
      <p className="text-sm text-gray-500 mb-4">{product.category?.name}</p>
      <div className="flex items-center justify-between">
        <span className="font-black text-blue-600">Rs. {product.basePrice}</span>
        <button className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">View →</button>
      </div>
    </Link>
  );
}