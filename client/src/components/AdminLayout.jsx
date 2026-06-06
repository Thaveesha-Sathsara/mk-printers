import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Package, ShoppingBag, Gift, Settings, Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/campaigns', label: 'Mystery Box', icon: Gift },
  ];

  return (
    <div className="h-screen w-full bg-gray-100 flex overflow-hidden font-sans">
      
      {/* MOBILE OVERLAY: Darkens the background when menu is open */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* SIDEBAR: Slides in on mobile, strictly locked w-64 on desktop */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-gray-900 text-white flex flex-col shrink-0
        transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-20 flex items-center px-6 border-b border-gray-800 shrink-0">
          <img src="/logo.png" alt="M.K. Printers" className="h-10 w-auto mr-3" onError={(e) => e.target.style.display = 'none'} />
          <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">Portal</span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-800 shrink-0">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-white transition-colors text-left">
            <Settings className="h-5 w-5" />
            <span className="font-semibold">Settings</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* MOBILE TOP BAR: Only visible on phones */}
        <header className="md:hidden h-20 bg-gray-900 text-white flex items-center justify-between px-4 shrink-0 shadow-md z-30">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="M.K. Printers" className="h-8 w-auto" onError={(e) => e.target.style.display = 'none'} />
            <span className="font-bold tracking-widest uppercase text-sm">Admin</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-300 hover:text-white focus:outline-none">
            <Menu className="h-7 w-7" />
          </button>
        </header>

        {/* SCROLLABLE PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50">
          <Outlet /> 
        </main>

      </div>
    </div>
  );
}