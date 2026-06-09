import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, ArrowLeft, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function DesignStudio() {
    <Helmet>
        <title>Design Studio | M.K. Printers</title>
        <meta name="description" content="We are building the ultimate interactive 3D design studio. Soon, you will be able to customize all our products with your own text, colors, and images in real-time." />
        <meta name="keywords" content="3D design studio, interactive product customization, real-time design, custom product creator, M.K. Printers design studio" />
    </Helmet>
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-12 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-8 shadow-2xl">
          <Palette className="h-10 w-10 text-blue-400" />
        </div>
        
        <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-blue-500/20 text-blue-300 text-sm font-bold tracking-wider uppercase mb-6 border border-blue-500/30">
          <Sparkles className="h-4 w-4" /> The Ultimate 3D Studio
        </span>
        
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
          Design Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Imagination.</span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-10 font-medium leading-relaxed">
          We are building the ultimate interactive 3D design studio. Soon, you will be able to customize all our products with your own text, colors, and images in real-time.
        </p>

        <Link to="/" className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-transform hover:scale-105 shadow-xl shadow-white/10 flex items-center gap-2">
          <ArrowLeft className="h-5 w-5" /> Return to Home
        </Link>
      </div>
    </div>
  );
}