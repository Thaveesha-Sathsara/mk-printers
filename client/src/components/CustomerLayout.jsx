import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, Search, ExternalLink, User, LogIn, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';

export default function CustomerLayout() {
    const { cart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // UI States
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    // Handle global search submission
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">

            {/* NAVBAR */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3">
                            <img src="/logo.jpeg" alt="M.K. Printers Logo" className="h-12 w-auto object-contain" onError={(e) => e.target.style.display = 'none'} />
                            <span className="text-2xl font-black tracking-tight text-gray-900">M.K. Printers</span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex gap-8">
                            <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Home</Link>
                            <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Home Decor</Link>
                            <Link to="/products" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Personalized Printing</Link>
                            <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Business Essentials</Link>
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-5">
                            {/* Search Toggle */}
                            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-gray-500 hover:text-gray-900">
                                {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                            </button>
                            
                            {/* Cart */}
                            <Link to="/cart" className="text-gray-500 hover:text-gray-900 relative cursor-pointer">
                                <ShoppingCart className="h-6 w-6" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                                    {cartCount}
                                    </span>
                                )}
                            </Link>
                            
                            {/* Auth */}
                            {user ? (
                                <Link to="/profile" className="text-gray-500 hover:text-blue-600 transition-colors p-2 bg-gray-50 rounded-full hidden md:flex">
                                    <User className="h-5 w-5" />
                                </Link>
                            ) : (
                                <button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className="hidden md:flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-xl transition-all font-semibold text-sm"
                                >
                                    <LogIn className="h-4 w-4" /> Login
                                </button>
                            )}
                            
                            {/* Mobile Menu Toggle */}
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-500 hover:text-gray-900">
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* EXPANDABLE SEARCH BAR */}
                {isSearchOpen && (
                    <div className="absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-4 shadow-lg animate-in slide-in-from-top-2">
                        <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search mugs, apparel, business cards..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                autoFocus
                            />
                        </form>
                    </div>
                )}

                {/* MOBILE MENU DROPDOWN */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-4 shadow-lg absolute w-full top-20 left-0">
                        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium py-2">Home</Link>
                        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium py-2">Home Decor</Link>
                        <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium py-2">Personalized Printing</Link>
                        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium py-2">Business Essentials</Link>
                        
                        <div className="pt-4 border-t border-gray-100">
                            {user ? (
                                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-600 font-medium py-2">
                                    <User className="h-5 w-5" /> My Profile
                                </Link>
                            ) : (
                                <button onClick={() => { setIsMobileMenuOpen(false); setIsAuthModalOpen(true); }} className="flex items-center gap-2 text-gray-600 font-medium py-2 w-full text-left">
                                    <LogIn className="h-5 w-5" /> Login / Register
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer remains unchanged... */}
            <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">Premium custom printing, magical mugs, custom apparel, and business statationery delivered with quality.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Contact Us</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>Whatsapp: +94 75 709 8761</li>
                                <li>Email: hello@mk-printers.com.lk</li>
                                <li>Location: Ihala Bomiriya, Kaduwela, Sri Lanka</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-500 flex flex-col items-center">
                        <p>&copy; {new Date().getFullYear()} M.K. Printers. All rights reserved.</p>
                        <p className="mt-2 flex items-center gap-1.5 bg-gray-800/50 py-1.5 px-4 rounded-full border border-gray-700/50">
                            Developed with <span className="text-red-500 animate-pulse">❤️</span> by
                            <a href="https://tsvithana.vercel.app" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold transition-colors">
                                Thaveesha Vithana <ExternalLink className="h-3 w-3" />
                            </a>
                        </p>
                    </div>
                </div>
            </footer>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onLoginSuccess={(userData) => setIsAuthModalOpen(false)}
            />
        </div>
    );
}