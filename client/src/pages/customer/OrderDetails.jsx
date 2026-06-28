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
        API.get(`/orders/${id}`).then(res => {
            if (res.data.success) {
                setOrder(res.data.order);
                setLoading(false);
                
                if (res.data.order.items[0]?.product) {
                    API.get(`/products`).then(prodRes => {
                        if (prodRes.data.success) setSimilarProducts(prodRes.data.products.slice(0, 4));
                    });
                }
            }
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
        window.scrollTo(0, 0);
    }, [id]);

    const handleCancelOrder = async () => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            await API.put(`/orders/update-status/${id}`, { status: 'Cancelled' });
            setOrder({ ...order, status: 'Cancelled' }); 
        } catch (error) { alert("Failed to cancel order.", error); }
    };

    const handleCopyDetails = () => {
        const details = `Order ID: ${order._id}\nTotal: Rs. ${order.totalAmount}\nStatus: ${order.status}`;
        navigator.clipboard.writeText(details);
        alert("Order details copied!");
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-sm font-bold text-gray-500">Loading Order Details...</div>;
    if (!order) return <div className="min-h-screen flex items-center justify-center font-bold">Order not found.</div>;

    return (
        <div className="bg-gray-50 min-h-screen relative pb-24 md:pb-12">
            <Helmet>
                <title>Order #{order._id.slice(-6).toUpperCase()} | M.K. Printers</title>
                <style>{`@media (max-width: 767px) { footer, .pb-safe { display: none !important; } }`}</style>
            </Helmet>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 md:py-8">
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
                                <button onClick={handleCopyDetails} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                    <Copy className="h-4 w-4 inline mr-1" /> Copy
                                </button>
                            </div>
                            
                            <div className="space-y-5">
                                {order.items.map((item, idx) => {
                                    const imgUrl = item.image || item.product?.images?.[0] || '/placeholder.png';
                                    const v = item.variants || item.variant || {};
                                    
                                    return (
                                        <div key={idx} className="flex gap-4 items-start pb-5 border-b border-gray-50 last:border-0 last:pb-0">
                                            <div className="h-20 w-20 shrink-0 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 p-1 flex items-center justify-center">
                                                <img src={imgUrl} alt={item.name} className="h-full w-full object-cover rounded-lg" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                                                <p className="text-xs font-bold text-gray-900 mt-1">Rs. {item.price} <span className="text-gray-400 font-medium">x {item.quantity}</span></p>
                                                
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {v.color && (
                                                        <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1">
                                                            <span className="h-2 w-2 rounded-full border border-gray-300" style={{backgroundColor: v.color.value || v.color}}></span> Color
                                                        </span>
                                                    )}
                                                    {v.size && <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md">Size: {v.size.value || v.size}</span>}
                                                    
                                                    {v.custom && Object.entries(v.custom).map(([key, opt]) => (
                                                        <span key={key} className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md">{key}: {opt.value || opt}</span>
                                                    ))}
                                                </div>

                                                {item.customText && <p className="text-[10px] text-gray-500 mt-2 bg-gray-50 inline-block px-2 py-1 rounded-md border border-gray-100">Text: "{item.customText}"</p>}
                                                {item.customImage && <a href={item.customImage} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline mt-1 block font-bold">View Uploaded Artwork</a>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Clean Summaries & Actions */}
                    <div className="md:col-span-4 space-y-4">
                        
                        {/* Status Box */}
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

                        {/* Un-stretched Summary Box */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                            <h3 className="text-sm font-black text-gray-900 mb-4">Payment Summary</h3>
                            <div className="space-y-3 text-xs text-gray-600 mb-4">
                                <div className="flex justify-between"><span>Subtotal</span><span className="font-bold text-gray-900">Rs. {order.totalAmount}</span></div>
                                <div className="flex justify-between"><span>Shipping</span><span className="text-gray-400 italic">Calculated via WhatsApp</span></div>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className="text-sm font-bold text-gray-900">Total</span>
                                <span className="text-xl font-black text-blue-600">Rs. {order.totalAmount}</span>
                            </div>
                        </div>

                        {/* Separate Actions Box (Desktop Only) */}
                        <div className="hidden md:flex flex-col gap-3">
                            <button onClick={() => window.open(`https://wa.me/94757098761?text=${encodeURIComponent(`Hi, I have a question about Order #${order._id.slice(-6).toUpperCase()}.`)}`, '_blank')} 
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2 text-sm shadow-md">
                                <MessageCircle className="h-5 w-5" /> Ask about this order
                            </button>
                            {order.status === 'Pending' && (
                                <button onClick={handleCancelOrder} className="w-full bg-white hover:bg-red-50 text-red-600 font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 text-sm border border-red-200">
                                    <XCircle className="h-4 w-4" /> Cancel Order
                                </button>
                            )}
                        </div>

                    </div>
                </div>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <h3 className="text-sm font-black text-gray-900 mb-4">You might also like</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                            {similarProducts.map(sim => <ProductCard key={sim._id} product={sim} />)}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Bottom Actions (WhatsApp + Cancel side by side) */}
            <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] flex gap-2">
                {order.status === 'Pending' && (
                    <button onClick={handleCancelOrder} className="flex-1 bg-red-50 text-red-600 font-bold py-3.5 rounded-xl flex justify-center items-center gap-1.5 text-sm border border-red-200">
                        <XCircle className="h-4 w-4" /> Cancel
                    </button>
                )}
                <button onClick={() => window.open(`https://wa.me/94757098761?text=${encodeURIComponent(`Hi, I have a question about Order #${order._id.slice(-6).toUpperCase()}.`)}`, '_blank')} 
                        className="flex-[2] bg-green-500 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 text-sm shadow-md">
                    <MessageCircle className="h-5 w-5" /> WhatsApp Support
                </button>
            </div>
        </div>
    );
}