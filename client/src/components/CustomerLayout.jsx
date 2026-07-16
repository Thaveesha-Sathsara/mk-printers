import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, Search, ExternalLink, User, LogIn, X, Phone, Mail, MapPin, ArrowRight, Tag, Package } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';

export default function CustomerLayout() {
    const { cart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    // handle global search submission
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

            {/* navbar */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3">
                            <img src="/logo.jpeg" alt="M.K. Printers Logo" className="h-12 w-auto object-contain" onError={(e) => e.target.style.display = 'none'} />
                            <span className="text-2xl font-black tracking-tight text-gray-900">M.K. Printers</span>
                        </Link>

                        {/* desktop nav */}
                        <nav className="hidden md:flex gap-8">
                            <Link to="/products" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">All Products</Link>
                            <Link to="/home-decor" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Home Decor</Link>
                            <Link to="/business-essentials" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Business Essentials</Link>
                            <Link to="/design-studio" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Design Studio</Link>
                        </nav>

                        {/* actions */}
                        <div className="flex items-center gap-5">
                            {/* search toggle */}
                            <button aria-label="Toggle Search" onClick={() => setIsSearchOpen(!isSearchOpen)} className="hidden text-gray-500 hover:text-gray-900">
                                {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                            </button>
                            
                            {/* cart */}
                            <Link to="/cart" className="md:flex text-gray-500 hover:text-gray-900 relative cursor-pointer">
                                <ShoppingCart className="h-6 w-6" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                                    {cartCount}
                                    </span>
                                )}
                            </Link>
                            
                            {/* auth */}
                            {user ? (
                                <Link to="/profile" className="text-gray-500 hover:text-blue-600 transition-colors p-2 bg-gray-50 rounded-full hidden md:flex">
                                    <User className="h-5 w-5" />
                                </Link>
                            ) : (
                                <button
                                    aria-label="Login"
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className="hidden md:flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-xl transition-all font-semibold text-sm"
                                >
                                    <LogIn className="h-4 w-4" /> Login
                                </button>
                            )}
                            
                            {/* mobile menu toggle */}
                            <button aria-label="Open Mobile Menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-500 hover:text-gray-900">
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* expandable search bar */}
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

                {/* mobile menu dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-4 shadow-lg absolute w-full top-20 left-0">
                        <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium py-2">All Products</Link>
                        <Link to="/home-decor" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium py-2">Home Decor</Link>
                        <Link to="/business-essentials" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium py-2">Business Essentials</Link>
                        <Link to="/design-studio" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium py-2">Design Studio</Link>

                        <div className="pt-4 border-t border-gray-100">
                            {user ? (
                                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-600 font-medium py-2">
                                    <User className="h-5 w-5" /> My Profile
                                </Link>
                            ) : (
                                <button aria-label="Login / Register" onClick={() => { setIsMobileMenuOpen(false); setIsAuthModalOpen(true); }} className="flex items-center gap-2 text-gray-600 font-medium py-2 w-full text-left">
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

            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 pb-safe flex justify-around py-3">
                <Link to="/products" className="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600">
                    <Package className="h-6 w-6" />
                    <span className="text-[10px] font-bold">Products</span>
                </Link>
                <Link to="/products?q=offer" className="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600">
                    <Tag className="h-6 w-6" />
                    <span className="text-[10px] font-bold">Offers</span>
                </Link>
                <Link to="/cart" className="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600 relative">
                    <ShoppingCart className="h-6 w-6" />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 right-2 bg-red-500 text-white text-[10px] h-4 w-4 flex items-center justify-center rounded-full">
                            {cartCount}
                        </span>
                    )}
                    <span className="text-[10px] font-bold">Cart</span>
                </Link>
                <Link to="/profile" className="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600">
                    <User className="h-6 w-6" />
                    <span className="text-[10px] font-bold">Account</span>
                </Link>
            </div>

            {/* footer */}
            <footer className="bg-gray-900 text-gray-300 py-16 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* footer grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        
                        {/* 1. Brand & About */}
                        <div className="flex flex-col space-y-6">
                            <div className="flex items-center gap-3">
                                {/* <img src="/logo.jpeg" alt="M.K. Printers Logo" className="h-10 w-auto rounded-md bg-white p-1" /> */}
                                <span className="text-2xl font-black text-white tracking-tight">M.K. Printers</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Bringing your ideas to life with premium custom printing, interactive 3D designs, and top-tier quality delivered across Sri Lanka.
                            </p>
                            
                            {/* Social Icons */}
                            <div className="flex gap-4 pt-2">
                                <a href="https://web.facebook.com/profile.php?id=100091288278761" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors duration-300">
                                    <FaFacebook className="w-5 h-5" />
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors duration-300">
                                    <FaInstagram className="w-5 h-5" />
                                </a>
                                <a href="https://www.tiktok.com/@m.k.printers0?_r=1&_t=ZS-973tRzkMJvc" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors duration-300">
                                    <FaTiktok className="w-5 h-5" />
                                </a>

                            </div>
                        </div>

                        {/* 2. Quick Links */}
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Home</Link></li>
                                <li><Link to="/products" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Shop All Products</Link></li>
                                <li><Link to="/design-studio" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> 3D Design Studio</Link></li>
                                <li><Link to="/profile" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> My Account</Link></li>
                            </ul>
                        </div>

                        {/* 3. Categories */}
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Categories</h4>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li><Link to="/products?q=mug" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Magic Mugs</Link></li>
                                <li><Link to="/products?q=apparel" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Custom Apparel</Link></li>
                                <li><Link to="/business-essentials" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Business Stationery</Link></li>
                                <li><Link to="/home-decor" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Home Decor</Link></li>
                            </ul>
                        </div>

                        {/* 4. Contact Info */}
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contact Us</h4>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                    <span>+94 75 709 8761 <br/><span className="text-xs text-gray-400 font-medium">(WhatsApp Available)</span></span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                                    <a href="mailto:hello@mk-printers.com.lk" className="hover:text-blue-400 transition-colors" aria-label="Email us">hello@mk-printers.com.lk</a>
                                </li>
                                <li className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                    <span>Ihala Bomiriya, <br/>Kaduwela, Sri Lanka</span>
                                </li>
                            </ul>
                        </div>

                    </div>

                    {/* Bottom Section - Copyright & Dev Credit */}
                    <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                        <p>&copy; {new Date().getFullYear()} M.K. Printers. All rights reserved.</p>
                        
                        {/* Developer Credit */}
                        <p className="flex items-center gap-1.5 bg-gray-800/50 py-1.5 px-4 rounded-full border border-gray-700/50 hover:bg-gray-800 transition-colors">
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