import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../utils/api';
import { ArrowLeft, Copy, MessageCircle, XCircle, Package, MapPin, CalendarClock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../../components/ProductCard';

export default function OrderDetails() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await API.get(`/orders/${id}`);
                if (res.data.success) {
                    const o = res.data.order;
                    setOrder(o);
                    
                    if (o.items && o.items[0]?.product) {
                        const prodRes = await API.get(`/products`);
                        if (prodRes.data.success) {
                            // Assuming backend populates the product ID
                            const similar = prodRes.data.products.slice(0, 6); // Simplified logic
                            setSimilarProducts(similar);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch order details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
        window.scrollTo(0, 0);
    }, [id]);

    const handleCancelOrder = async () => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            await API.put(`/orders/update-status/${id}`, { status: 'Cancelled' });
            setOrder({ ...order, status: 'Cancelled' }); 
        } catch (error) {
            alert("Failed to cancel order.", error);
        }
    };

    const handleCopyDetails = () => {
        const details = `Order ID: ${order._id}\nTotal: Rs. ${order.totalAmount}\nStatus: ${order.status}`;
        navigator.clipboard.writeText(details);
        alert("Order details copied to clipboard!");
    };

    const handleAskWhatsApp = () => {
        const msg = encodeURIComponent(`Hi, I have a question about my Order #${order._id.slice(-6).toUpperCase()}.`);
        window.open(`https://wa.me/94757098761?text=${msg}`, '_blank');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-sm font-bold text-gray-500">Loading Order Details...</div>;
    if (!order) return <div className="min-h-screen flex items-center justify-center font-bold">Order not found.</div>;

    return (
        <div className="bg-gray-50 min-h-screen relative pb-28 md:pb-12">
            <Helmet>
                <title>Order #{order._id.slice(-6).toUpperCase()} | M.K. Printers</title>
                <style>{`@media (max-width: 767px) { footer, .pb-safe { display: none !important; } }`}</style>
            </Helmet>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 md:py-8">
                <Link to="/orders" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 mb-6 transition-colors uppercase tracking-wider">
                    <ArrowLeft className="h-3 w-3" /> Back to Orders
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Left Column: Order Items */}
                    <div className="md:col-span-8 space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                                <div>
                                    <h2 className="text-lg font-black text-gray-900">Order Items</h2>
                                    <p className="text-xs text-gray-400 font-mono mt-0.5">#{order._id.toUpperCase()}</p>
                                </div>
                                <button onClick={handleCopyDetails} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg">
                                    <Copy className="h-3 w-3" /> Copy
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-start">
                                        <div className="h-16 w-16 shrink-0 rounded-lg border border-gray-100 overflow-hidden bg-gray-50">
                                            {item.customImage ? (
                                                <img src={item.customImage} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center"><Package className="h-6 w-6 text-gray-300" /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                                            <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity} x Rs. {item.price}</p>
                                            {item.customText && <p className="text-[10px] text-gray-400 mt-1 bg-gray-50 inline-block px-2 py-1 rounded">Text: {item.customText}</p>}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-black text-gray-900">Rs. {item.quantity * item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Similar Products (Desktop View) */}
                        {similarProducts.length > 0 && (
                            <div className="hidden md:block bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                                <h3 className="text-sm font-black text-gray-900 mb-4">Add to your next order</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {similarProducts.slice(0, 3).map(sim => (
                                        <ProductCard key={sim._id} product={sim} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Order Summary & Status */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                            <h3 className="text-sm font-black text-gray-900 mb-4">Summary</h3>
                            
                            <div className="space-y-3 text-xs text-gray-600 mb-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-gray-900">Rs. {order.totalAmount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>Calculated via WhatsApp</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className="text-sm font-bold text-gray-900">Total</span>
                                <span className="text-xl font-black text-blue-600">Rs. {order.totalAmount}</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <CalendarClock className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date Placed</p>
                                    <p className="text-xs font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
                                    <p className={`text-xs font-black ${order.status === 'Cancelled' ? 'text-red-600' : 'text-green-600'}`}>{order.status}</p>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Action Buttons */}
                        <div className="hidden md:flex flex-col gap-3">
                            <button onClick={handleAskWhatsApp} className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 text-sm border border-green-200">
                                <MessageCircle className="h-4 w-4" /> Ask via WhatsApp
                            </button>
                            {order.status === 'Pending' && (
                                <button onClick={handleCancelOrder} className="w-full bg-white hover:bg-red-50 text-red-600 font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 text-sm border border-red-200">
                                    <XCircle className="h-4 w-4" /> Cancel Order
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Similar Products (Mobile View) */}
                    {similarProducts.length > 0 && (
                        <div className="md:hidden col-span-1 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mt-2">
                            <h3 className="text-sm font-black text-gray-900 mb-4">Add to your next order</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {similarProducts.slice(0, 4).map(sim => (
                                    <ProductCard key={sim._id} product={sim} />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Amount</span>
                    <span className="text-lg font-black text-gray-900">Rs. {order.totalAmount}</span>
                </div>
                <div className="flex gap-2">
                    {order.status === 'Pending' && (
                        <button onClick={handleCancelOrder} className="flex-1 bg-red-50 text-red-600 font-bold py-3 rounded-xl flex justify-center items-center gap-1.5 text-sm border border-red-200">
                            <XCircle className="h-4 w-4" /> Cancel
                        </button>
                    )}
                    <button onClick={handleAskWhatsApp} className="flex-[1.5] bg-green-500 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-1.5 text-sm shadow-md">
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
}