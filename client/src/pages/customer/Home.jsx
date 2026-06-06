import { ArrowRight, Image as ImageIcon, Sparkles, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const categories = [
    { title: "Magic Mugs", desc: "Reveals your photo when hot", icon: Sparkles, color: "bg-purple-100 text-purple-600" },
    { title: "Custom Apparel", desc: "T-Shirts & Hoodies", icon: ImageIcon, color: "bg-blue-100 text-blue-600" },
    { title: "Business Stationery", desc: "Cards, Flyers & Documents", icon: Printer, color: "bg-emerald-100 text-emerald-600" },
  ];

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white py-24 px-4 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-12 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-300 text-sm font-bold tracking-wider uppercase mb-6 border border-blue-500/30">
            Premium Printing Services
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            Bring Your Ideas <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">To Life.</span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-medium">
            From futuristic magic mugs to premium business cards and custom apparel. Upload your designs and see them instantly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg shadow-white/10 flex items-center justify-center gap-2">
              Start Designing <ArrowRight className="h-5 w-5" />
            </button>
            <Link to="/products" className="bg-gray-800/50 backdrop-blur-md text-white border border-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors flex items-center justify-center">
              Explore Products
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What We Create</h2>
            <p className="text-gray-500 text-lg">High-quality printing for personal gifts and business needs.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                <div className={`w-14 h-14 rounded-xl ${cat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.title}</h3>
                <p className="text-gray-500 mb-6">{cat.desc}</p>
                <div className="text-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Browse {cat.title.split(' ')[0]} <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLACEHOLDER PRODUCT GRID */}
      <section className="py-20 px-4 bg-gray-50 border-t border-gray-100">
         <div className="max-w-7xl mx-auto text-center text-gray-400">
            <Printer className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h2 className="text-2xl font-bold text-gray-400">Interactive Product Grid Coming Soon</h2>
            <p>This is where the live customizer and checkout flow will live.</p>
         </div>
      </section>
    </div>
  );
}