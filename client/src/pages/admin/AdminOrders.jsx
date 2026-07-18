import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { Package, Clock, CheckCircle, XCircle, Printer, Truck, ExternalLink, Image as ImageIcon } from 'lucide-react';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await API.get('/orders/all');
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
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await API.put(`/orders/update-status/${orderId}`, { status: newStatus });
            // refresh the list to show the new status
            fetchOrders(); 
        } catch (error) {
            alert("Failed to update status.", error);
        }
    };

    // Helper function for beautiful status badges
    const StatusBadge = ({ status }) => {
        const styles = {
            'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Processing': 'bg-blue-100 text-blue-800 border-blue-200',
            'Printing': 'bg-purple-100 text-purple-800 border-purple-200',
            'Shipped': 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'Delivered': 'bg-green-100 text-green-800 border-green-200',
            'Cancelled': 'bg-red-100 text-red-800 border-red-200',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
                {status}
            </span>
        );
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading orders...</div>;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                        <Package className="h-8 w-8 text-blue-600" /> Order Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Review incoming orders and update production statuses.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                                <th className="p-4 font-bold">Order ID & Date</th>
                                <th className="p-4 font-bold">Customer Info</th>
                                <th className="p-4 font-bold">Items & Custom Designs</th>
                                <th className="p-4 font-bold">Total</th>
                                <th className="p-4 font-bold">Status Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                    
                                    {/* Order ID & Date */}
                                    <td className="p-4 align-top">
                                        <div className="font-mono text-xs text-blue-600 font-bold mb-1">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </div>
                                        <div className="text-gray-500 text-xs">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>

                                    {/* Customer Info */}
                                    <td className="p-4 align-top">
                                        <div className="font-bold text-gray-900">{order.user?.name || 'Unknown User'}</div>
                                        <div className="text-gray-500">{order.user?.email}</div>
                                        <div className="text-gray-500">{order.user?.phone}</div>
                                    </td>

                                    {/* Items & Custom Uploads */}
                                    <td className="p-4 align-top">
                                        <ul className="space-y-3">
                                            {order.items.map((item, idx) => (
                                                <li key={idx} className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                    <div className="font-bold text-gray-800">{item.quantity}x {item.name}</div>
                                                    
                                                    {item.customText && (
                                                        <div className="text-xs text-blue-600 mt-1 font-medium bg-blue-50 p-1.5 rounded">
                                                            Text: "{item.customText}"
                                                        </div>
                                                    )}
                                                    
                                                    {item.customImage && (
                                                        <a href={item.customImage} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 mt-1 font-bold">
                                                            <ImageIcon className="h-3 w-3" /> View Uploaded Image <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>

                                    {/* Total */}
                                    <td className="p-4 align-top font-black text-gray-900">
                                        Rs. {order.totalAmount}
                                    </td>

                                    {/* Status Controller */}
                                    <td className="p-4 align-top">
                                        <div className="flex flex-col gap-2 items-start">
                                            <StatusBadge status={order.status} />
                                            <select 
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                className="mt-2 text-xs border border-gray-300 rounded-lg p-1.5 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Printing">Printing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && (
                        <div className="p-12 text-center text-gray-500 font-medium">
                            No orders have been placed yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}