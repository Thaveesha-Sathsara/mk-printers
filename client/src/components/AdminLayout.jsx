import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Package, ShoppingBag, Gift, Settings, Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  
  // Auto-detect screen size to open/close menu by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/campaigns', label: 'Mystery Box', icon: Gift },
  ];

  return (
    <div className="h-screen w-full bg-gray-100 flex overflow-hidden font-sans">
      
      {/* mobile overlay, background */}
      {isSidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* sidebar */}
      <aside className={`
        fixed md:relative z-50 h-full
        w-64 bg-gray-900 text-white flex flex-col shrink-0
        transition-all duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0 ml-0' : '-translate-x-full md:-ml-64'}
      `}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800 shrink-0">
          <div className="flex items-center">
            <img src="/logo.png" alt="M.K. Printers" className="h-10 w-auto mr-3" onError={(e) => e.target.style.display = 'none'} />
            <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">Portal</span>
          </div>
          {/* Close X button only shows on mobile */}
          {isMobile && (
            <button aria-label="Close sidebar" onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => isMobile && setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-800 shrink-0">
          <button aria-label="Open Settings" className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-white transition-colors text-left">
            <Settings className="h-5 w-5" />
            <span className="font-semibold">Settings</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/50">
        
        {/* UNIVERSAL TOP BAR */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              aria-label="Toggle sidebar"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
        </header>

        {/* SCROLLABLE PAGE CONTENT (Dashboard loads here!) */}
        <main className="flex-1 overflow-y-auto relative">
          <Outlet /> 
        </main>

      </div>
    </div>
  );
}