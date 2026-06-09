import { ArrowRight, Image as ImageIcon, Sparkles, Printer, ShieldCheck, Truck, Clock, Upload, MousePointerClick, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/ProductCard';

export default function Home() {
  const { products, loading } = useProducts();

  // Filter to show ONLY 3D products, or fallback to regular products if none exist yet
  const featuredProducts = products.filter(p => p.model3dUrl).slice(0, 4);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4);

  const categories = [
    { title: "Magic Mugs", desc: "Reveals your photo when hot", icon: Sparkles, color: "bg-purple-100 text-purple-600", link: "/products?q=mug" },
    { title: "Custom Apparel", desc: "T-Shirts & Hoodies", icon: ImageIcon, color: "bg-blue-100 text-blue-600", link: "/products?q=apparel" },
    { title: "Business Stationery", desc: "Cards, Flyers & Documents", icon: Printer, color: "bg-emerald-100 text-emerald-600", link: "/products?q=business" },
  ];

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white py-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-12 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="inline-block py-1.5 px-4 rounded-full bg-blue-500/20 text-blue-300 text-sm font-bold tracking-wider uppercase mb-6 border border-blue-500/30">
            M.K. Printers Premium
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            Bring Your Ideas <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">To Life.</span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Experience our interactive 3D studio. Customize premium mugs, apparel, and business essentials instantly before you buy.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/products" className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-transform hover:scale-105 shadow-xl shadow-white/10 flex items-center justify-center gap-2">
              Start Exploring <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST BAR (E-commerce Essential) */}
      <section className="bg-white border-b border-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
            <div className="flex items-center gap-3 text-gray-600 font-semibold">
                <ShieldCheck className="h-6 w-6 text-green-500" /> Premium Quality Guarantee
            </div>
            <div className="flex items-center gap-3 text-gray-600 font-semibold">
                <Truck className="h-6 w-6 text-blue-500" /> Island-Wide Delivery
            </div>
            <div className="flex items-center gap-3 text-gray-600 font-semibold">
                <Clock className="h-6 w-6 text-purple-500" /> Fast Turnaround Time
            </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 mb-4 border border-gray-100">
                        <MousePointerClick className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">1. Select a Product</h3>
                    <p className="text-gray-500">Choose from our range of premium blanks.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-purple-600 mb-4 border border-gray-100">
                        <Upload className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">2. Customize in 3D</h3>
                    <p className="text-gray-500">Upload photos and see a live 3D preview.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-green-600 mb-4 border border-gray-100">
                        <Package className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">3. We Print & Ship</h3>
                    <p className="text-gray-500">Fast, high-quality production to your door.</p>
                </div>
            </div>
        </div>
      </section>

      {/* FEATURED 3D PRODUCTS GRID */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Interactive Products</h2>
              <p className="text-gray-500 text-lg">Try our live 3D customizer on these featured items.</p>
            </div>
            <Link to="/products" className="hidden md:flex text-blue-600 font-bold hover:underline items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(n => <div key={n} className="bg-gray-100 aspect-[3/4] rounded-2xl"></div>)}
             </div>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayProducts.map(product => (
                    <ProductCard key={product._id} product={product} />
                ))}
             </div>
          )}

          <Link to="/products" className="md:hidden mt-8 w-full bg-gray-50 text-gray-900 font-bold py-4 rounded-xl flex justify-center items-center gap-2 border border-gray-200">
              View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-20 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-500 text-lg">Find exactly what you need for your next project.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
              <Link to={cat.link} key={idx} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-2xl ${cat.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <cat.icon className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{cat.title}</h3>
                <p className="text-gray-500 mb-6">{cat.desc}</p>
                <div className="mt-auto text-blue-600 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Browse Collection <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}