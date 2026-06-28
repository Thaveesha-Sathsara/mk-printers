import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { useSearchParams, Link } from 'react-router-dom';
import { Package, ArrowLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Orders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'All';
    const TABS = ['All', 'Pending', 'Processing', 'Shipped', 'Cancellations'];

    useEffect(() => {
        if (user) {
            API.get('/orders/my-orders')
                .then(res => { if (res.data.success) setOrders(res.data.orders); })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'All') return order.status !== 'Cancelled';
        if (activeTab === 'Processing') return ['Processing', 'Printing'].includes(order.status);
        if (activeTab === 'Cancellations') return order.status === 'Cancelled';
        return order.status === activeTab;
    });

    const StatusBadge = ({ status }) => {
        const styles = {
            'Pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
            'Processing': 'bg-blue-50 text-blue-700 border-blue-200',
            'Printing': 'bg-purple-50 text-purple-700 border-purple-200',
            'Shipped': 'bg-indigo-50 text-indigo-700 border-indigo-200',
            'Delivered': 'bg-green-50 text-green-700 border-green-200',
            'Cancelled': 'bg-red-50 text-red-700 border-red-200',
        };
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${styles[status] || 'bg-gray-50 text-gray-700'}`}>
                {status}
            </span>
        );
    };

    if (!user) return <div className="min-h-[60vh] flex items-center justify-center">Please log in.</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 bg-gray-50 min-h-screen">
            <Helmet><title>Order History | M.K. Printers</title></Helmet>

            <Link to="/profile" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 mb-6 transition-colors uppercase tracking-wider">
                <ArrowLeft className="h-3 w-3" /> Back to Profile
            </Link>

            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">Order History</h1>

            {/* 📱 MOBILE OPTIMIZED TABS */}
            <div className="flex overflow-x-auto gap-2 pb-4 mb-2 [&::-webkit-scrollbar]:hidden">
                {TABS.map((tab) => (
                    <button
                        key={tab} onClick={() => setSearchParams({ tab })}
                        className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                            activeTab === tab ? 'bg-gray-900 text-white border-gray-900 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500 animate-pulse text-sm font-bold">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm mt-4">
                    <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-gray-900 mb-1">No Orders Found</h3>
                    <p className="text-gray-500 text-xs">You don't have any {activeTab.toLowerCase()} orders right now.</p>
                </div>
            ) : (
                <div className="space-y-3 mt-4">
                    {filteredOrders.map((order) => {
                        const firstItem = order.items[0];
                        const additionalItems = order.items.length - 1;
                        
                        return (
                            <Link to={`/order/${order._id}`} key={order._id} className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all p-4 group">
                                <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-3">
                                    <span className="font-mono text-xs font-black text-gray-500">#{order._id.slice(-6).toUpperCase()}</span>
                                    <StatusBadge status={order.status} />
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    {/* Thumbnail */}
                                    <div className="h-16 w-16 shrink-0 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                                        {firstItem?.customImage ? (
                                            <img src={firstItem.customImage} alt="thumbnail" className="h-full w-full object-cover" />
                                        ) : (
                                            <ImageIcon className="h-6 w-6 text-gray-300" />
                                        )}
                                    </div>
                                    
                                    {/* Order Brief */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-gray-900 truncate">{firstItem?.name}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Qty: {firstItem?.quantity} 
                                            {additionalItems > 0 && <span className="font-bold text-blue-600 ml-2">+{additionalItems} more item{additionalItems > 1 ? 's' : ''}</span>}
                                        </p>
                                        <p className="text-sm font-black text-gray-900 mt-1">Rs. {order.totalAmount}</p>
                                    </div>
                                    
                                    <div className="shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors">
                                        <ChevronRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}