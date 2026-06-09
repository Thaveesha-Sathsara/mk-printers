import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function BusinessEssentials() {
    <Helmet>
        <title>Business Essentials | M.K. Printers</title>
        <meta name="description" content="Elevate your brand. Our premium business card, flyer, and corporate stationery customizer is launching soon to handle all your professional printing needs." />
        <meta name="keywords" content="custom business cards, personalized flyers, corporate stationery, professional printing, M.K. Printers business essentials" />
    </Helmet>
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-8 shadow-2xl">
          <Briefcase className="h-10 w-10 text-blue-400" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
          Business <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Essentials.</span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-10 font-medium leading-relaxed">
          Elevate your brand. Our premium business card, flyer, and corporate stationery customizer is launching soon to handle all your professional printing needs.
        </p>

        <Link to="/" className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-transform hover:scale-105 shadow-xl shadow-white/10 flex items-center gap-2">
          <ArrowLeft className="h-5 w-5" /> Return to Home
        </Link>
      </div>
    </div>
  );
}