import { useCart } from '../../context/CartContext';
import { Trash2, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../../components/AuthModal';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import API from '../../utils/api';

export default function Cart() {
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); // Loading state
    const { cart, removeFromCart, getCartTotal, clearCart } = useCart();

    // save to db then redirect to whatsapp with order details
    const handleConfirmOrder = async (currentUser = user) => {
        if (!currentUser || !currentUser.email) {
            setShowAuthModal(true);
            return;
        }

        setIsProcessing(true);

        try {
            // send the cart data to server
            const response = await API.post('/orders/create', {
                items: cart,
                totalAmount: getCartTotal()
            });

            if (response.data.success) {
                const orderId = response.data.orderId;

                // whatsapp msg layout build
                let message = `*NEW ORDER CONFIRMATION*\n`;
                message += `Order ID: *${orderId}*\n\n`;
                message += `Customer: *${currentUser.name}*\n`;
                message += `Email: *${currentUser.email}*\n\n`;
                
                cart.forEach((item, index) => {
                    message += `${index + 1}. *${item.name}*\n`;
                    message += `   Qty: ${item.quantity} | Rs. ${item.basePrice}\n`;
                    if (item.customText) message += `   Text: "${item.customText}"\n`;
                    if (item.customImage) message += `   [Custom Image Uploaded to System]\n`;
                    message += `\n`;
                });
                
                message += `*TOTAL: Rs. ${getCartTotal()}*\n\n`;
                message += `Please confirm my shipping costs and delivery timeline.`;

                // clear the cart and reset processing state
                clearCart();
                setIsProcessing(false);

                alert("Order secured successfully! You can track its status in your Profile. Redirecting to WhatsApp to confirm shipping...");

                // redirect to whatsapp
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/94757098761?text=${encodedMessage}`, '_blank');
            }
        } catch (error) {
            console.error("Order creation failed:", error);
            alert("There was an issue securing your order. Please try again.");
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/products" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Browse Products</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <Helmet>
                <title>Your Cart | M.K. Printers</title>
                <meta name="description" content="Review the items in your cart before checking out." />
            </Helmet>

            <h1 className="text-2xl font-black text-gray-900 mb-8">My Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item, index) => (
                        <div key={index} className="flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm items-center">
                            <img
                                src={item.customImage || item.images?.[0] || '/placeholder.png'}
                                alt={item.name}
                                className="h-24 w-24 object-cover rounded-xl border border-gray-200"
                            />
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                                <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                                {/* show custom items if available */}
                                {item.customText && <p className="text-xs text-blue-600 mt-1">Text: "{item.customText}"</p>}
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-xl text-gray-900 mb-2">Rs. {item.basePrice}</p>
                                <button aria-label="Remove" onClick={() => removeFromCart(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 h-fit sticky top-24">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                    <div className="flex justify-between mb-4 text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-bold">Rs. {getCartTotal()}</span>
                    </div>
                    <div className="flex justify-between mb-6 text-gray-600 border-b border-gray-200 pb-6">
                        <span>Shipping</span>
                        <span>Calculated on Whatsapp</span>
                    </div>
                    <div className="flex justify-between mb-8 text-xl">
                        <span className="font-black text-gray-900">Total</span>
                        <span className="font-black text-gray-900">Rs. {getCartTotal()}</span>
                    </div>

                    <button 
                        aria-label="Confirm Order" 
                        onClick={() => handleConfirmOrder()} 
                        disabled={isProcessing}
                        className={`w-full text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg transition-all ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {isProcessing ? (
                            <><Loader2 className="h-5 w-5 animate-spin" /> Securing Order...</>
                        ) : (
                            <>Confirm Order & WhatsApp <ArrowRight className="h-5 w-5" /></>
                        )}
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4">Your designs will be securely saved to our system before redirecting.</p>
                </div>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onLoginSuccess={(freshUser) => {
                    setShowAuthModal(false);
                    handleConfirmOrder(freshUser);
                }}
            />
        </div>
    );
}