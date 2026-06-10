import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { useSearchParams, Link } from 'react-router-dom';
import { Package, XCircle, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Orders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Grab the tab from the URL (e.g. ?tab=Pending)
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'All';

    // The clean tabs (removed negative ones from the main view)
    const TABS = ['All', 'Pending', 'Processing', 'Shipped', 'Cancellations'];

    const fetchMyOrders = async () => {
        try {
            const res = await API.get('/orders/my-orders');
            if (res.data.success) {
                setOrders(res.data.orders);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchMyOrders();
    }, [user]);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        
        try {
            await API.put(`/orders/update-status/${orderId}`, { status: 'Cancelled' });
            fetchMyOrders(); 
        } catch (error) {
            alert("Failed to cancel order.", error);
        }
    };

    // The Magic Filter: Grouping Processing & Printing together!
    const filteredOrders = orders.filter(order => {
        if (activeTab === 'All') return order.status !== 'Cancelled'; // Hide negativity in the All tab
        if (activeTab === 'Processing') return ['Processing', 'Printing'].includes(order.status);
        if (activeTab === 'Cancellations') return order.status === 'Cancelled';
        return order.status === activeTab;
    });

    const StatusBadge = ({ status }) => {
        const styles = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Processing': 'bg-blue-100 text-blue-800',
            'Printing': 'bg-purple-100 text-purple-800',
            'Shipped': 'bg-indigo-100 text-indigo-800',
            'Delivered': 'bg-green-100 text-green-800',
            'Cancelled': 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border border-white/50 ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    if (!user) return <div className="min-h-[60vh] flex items-center justify-center">Please log in.</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 bg-gray-50 min-h-screen">
            <Helmet>
                <title>Order History | M.K. Printers</title>
            </Helmet>

            <Link to="/profile" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Profile
            </Link>

            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">Order History</h1>

            {/* 📱 MOBILE OPTIMIZED TABS */}
            <div className="flex overflow-x-auto gap-2 pb-4 mb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setSearchParams({ tab })}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                            activeTab === tab 
                                ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500 animate-pulse font-medium">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm mt-4">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Nothing to see here</h3>
                    <p className="text-gray-500 text-sm">You don't have any {activeTab.toLowerCase()} orders right now.</p>
                </div>
            ) : (
                <div className="space-y-4 mt-4">
                    {filteredOrders.map((order) => (
                        <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="font-mono text-sm font-black text-gray-900">
                                        #{order._id.slice(-6).toUpperCase()}
                                    </span>
                                    <StatusBadge status={order.status} />
                                </div>
                                <span className="text-xs text-gray-400 font-bold block mb-3 uppercase tracking-wider">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                                
                                <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100/50">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="text-sm text-gray-700 flex justify-between font-medium">
                                            <span>{item.quantity}x {item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-row md:flex-col items-center justify-between md:items-end gap-3 border-t border-gray-100 md:border-t-0 pt-4 md:pt-0 shrink-0">
                                <div>
                                    <p className="text-xs text-gray-400 md:text-right mb-0.5 font-bold uppercase tracking-wider">Total</p>
                                    <p className="text-xl font-black text-gray-900">Rs. {order.totalAmount}</p>
                                </div>
                                
                                {order.status === 'Pending' && (
                                    <button 
                                        onClick={() => handleCancelOrder(order._id)}
                                        className="text-sm text-red-600 hover:text-red-700 font-bold flex items-center gap-1.5 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors"
                                    >
                                        <XCircle className="h-4 w-4" /> Cancel
                                    </button>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}