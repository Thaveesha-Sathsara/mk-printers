import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Package, Settings, LogOut, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Profile() {
    <Helmet>
        <title>My Profile | M.K. Printers</title>
        <meta name="description" content="View and manage your account details, recent orders, and saved designs in your M.K. Printers profile. Update your information, track your orders, and access exclusive features to enhance your shopping experience." />
        <meta name="keywords" content="user profile, account details, recent orders, saved designs, M.K. Printers account" />
    </Helmet>
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // If a guest tries to navigate directly to /profile, kick them to home
    if (!user) {
        return <Navigate to="/" />;
    }

    const handleLogout = () => {
        logout(); // Calls the function we built in AuthContext
        navigate('/'); // Redirect to homepage
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">My Account</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: USER INFO CARD */}
                <div className="col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md">
                            <User className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                        
                        <div className="w-full mt-6 space-y-3 text-left">
                            <div className="flex items-center gap-3 text-gray-600 text-sm p-3 bg-gray-50 rounded-xl">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-3 text-gray-600 text-sm p-3 bg-gray-50 rounded-xl">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            {user.address?.city && (
                                <div className="flex items-center gap-3 text-gray-600 text-sm p-3 bg-gray-50 rounded-xl">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span>{user.address.city}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SIDEBAR ACTIONS */}
                    <div className="mt-6 flex flex-col gap-3">
                        <button className="flex items-center gap-3 w-full p-4 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-colors border border-gray-200 shadow-sm">
                            <Settings className="w-5 h-5 text-gray-400" /> Account Settings
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full p-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition-colors border border-red-100 shadow-sm"
                        >
                            <LogOut className="w-5 h-5" /> Sign Out
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: RECENT ORDERS & SAVED DESIGNS */}
                <div className="col-span-1 md:col-span-2 flex flex-col gap-8">
                    
                    {/* Orders Section */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Package className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
                        </div>
                        
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center flex flex-col items-center justify-center">
                            <Package className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
                            <button onClick={() => navigate('/products')} className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium">
                                Start Shopping
                            </button>
                        </div>
                    </div>

                    {/* Saved Designs Section (Pulled from your Mongoose Schema) */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <User className="w-6 h-6" /> {/* Replace with a Paintbrush icon later if you want! */}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Saved Designs</h3>
                        </div>
                        
                        {user.savedDesigns && user.savedDesigns.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {/* Map over saved designs here later */}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm text-center py-8">No custom designs saved yet.</p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}