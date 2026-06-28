import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { Link } from 'react-router-dom';
import { 
    User as UserIcon, Package, Clock, Loader, Truck, 
    XCircle, Settings, HelpCircle, Headphones, ChevronRight, Edit2 
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Profile() {
    const { user } = useAuth(); // Removed logout from here!
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (user) {
            API.get('/orders/my-orders')
                .then(res => {
                    if (res.data.success) setOrders(res.data.orders);
                })
                .catch(err => console.error("Failed to fetch orders", err));
        }
    }, [user]);

    // Inside Profile.jsx
    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full">
                    <UserIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-xl font-black text-gray-900 mb-2">My Profile</h2>
                    <p className="text-gray-500 text-sm mb-6">Please log in to view your orders and account settings.</p>
                    <Link to="/login" className="block w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
                        Login / Register
                    </Link>
                </div>
            </div>
        );
    }

    const pendingCount = orders.filter(o => o.status === 'Pending').length;
    const processingCount = orders.filter(o => ['Processing', 'Printing'].includes(o.status)).length;
    const shippedCount = orders.filter(o => o.status === 'Shipped').length;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12 bg-gray-50 min-h-screen">
            <Helmet>
                <title>My Profile | M.K. Printers</title>
            </Helmet>

            {/* 1. User Info Header (Now with Phone & Edit Button) */}
            <div className="bg-white rounded-2xl p-6 flex items-center gap-5 shadow-sm border border-gray-100 mb-6 relative">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                    <UserIcon className="h-8 w-8" />
                </div>
                <div className="overflow-hidden flex-1">
                    <h2 className="text-xl font-black text-gray-900 truncate">{user.name}</h2>
                    <p className="text-sm text-gray-500 truncate">
                        {user.email} {user.phone && <span className="hidden sm:inline">• {user.phone}</span>}
                    </p>
                    {/* Mobile only phone number */}
                    {user.phone && <p className="text-sm text-gray-500 sm:hidden truncate">{user.phone}</p>}
                </div>
                
                {/* The Edit Profile Button */}
                <Link to="/settings" className="p-3 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-full transition-colors">
                    <Edit2 className="h-5 w-5" />
                </Link>
            </div>

            {/* 2. "My Orders" App-Style Grid */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="flex items-center font-black text-gray-900 text-lg"><Package className="h-5 w-5 mr-2" />My Orders</h3>
                    <Link to="/orders?tab=All" className="text-sm text-blue-600 font-bold flex items-center hover:underline">
                        View All <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                    <Link to="/orders?tab=Pending" className="flex flex-col items-center gap-2 group">
                        <div className="relative">
                            <div className="h-12 w-12 bg-gray-50 group-hover:bg-blue-50 rounded-full flex items-center justify-center transition-colors">
                                <Clock className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                            </div>
                            {pendingCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                                    {pendingCount}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-bold text-gray-600">Pending</span>
                    </Link>

                    <Link to="/orders?tab=Processing" className="flex flex-col items-center gap-2 group">
                        <div className="relative">
                            <div className="h-12 w-12 bg-gray-50 group-hover:bg-blue-50 rounded-full flex items-center justify-center transition-colors">
                                <Loader className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                            </div>
                            {processingCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                                    {processingCount}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-bold text-gray-600">Processing</span>
                    </Link>

                    <Link to="/orders?tab=Shipped" className="flex flex-col items-center gap-2 group">
                        <div className="relative">
                            <div className="h-12 w-12 bg-gray-50 group-hover:bg-blue-50 rounded-full flex items-center justify-center transition-colors">
                                <Truck className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                            </div>
                            {shippedCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                                    {shippedCount}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-bold text-gray-600">Shipped</span>
                    </Link>

                    <Link to="/orders?tab=Cancellations" className="flex flex-col items-center gap-2 group">
                        <div className="relative">
                            <div className="h-12 w-12 bg-gray-50 group-hover:bg-red-50 rounded-full flex items-center justify-center transition-colors">
                                <XCircle className="h-6 w-6 text-gray-600 group-hover:text-red-600" />
                            </div>
                        </div>
                        <span className="text-xs font-bold text-gray-600">Returns</span>
                    </Link>
                </div>
            </div>

            {/* 3. Account Tools & Nonsense */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="divide-y divide-gray-100">
                    {/* Changed this to a Link! */}
                    <Link to="/settings" className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <Settings className="h-5 w-5 text-gray-400" />
                            <span className="font-bold text-gray-700">Account Settings</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                    </Link>
                    <button className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <HelpCircle className="h-5 w-5 text-gray-400" />
                            <span className="font-bold text-gray-700">Help Center</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                    </button>
                    <button className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <Headphones className="h-5 w-5 text-gray-400" />
                            <span className="font-bold text-gray-700">Customer Care</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                    </button>
                </div>
            </div>
        </div>
    );
}