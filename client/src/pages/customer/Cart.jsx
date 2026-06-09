import { useCart } from '../../context/CartContext';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../../components/AuthModal';
import { useState } from 'react';

export default function Cart() {
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { cart, removeFromCart, getCartTotal, clearCart } = useCart();

    const handleWhatsappCheckout = (currentUser = user) => {
        if (!currentUser || !currentUser.email) {
            setShowAuthModal(true);
            return;
        }
        let message = `*NEW ORDER FROM M.K. PRINTERS*\n\n`;
            message += `Customer: *${currentUser.name}*\n`;
            message += `Email: *${currentUser.email}* \n`;
        cart.forEach((item, index) => {
            message += `${index + 1}. *${item.name}*\n`;
            message += `   Quantity: ${item.quantity} | Price: Rs. ${item.basePrice}\n`;
            if (item.customImage) message += `   [Contains Custom Design]\n`;
            message += `\n`;
        });
        message += `*TOTAL: Rs. ${getCartTotal()}*`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/94757098761?text=${encodedMessage}`, '_blank');
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
            <h1 className="text-3xl font-black text-gray-900 mb-8">Your Cart</h1>

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
                                <p className="text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-xl text-gray-900 mb-2">Rs. {item.basePrice}</p>
                                <button onClick={() => removeFromCart(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
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

                    <button onClick={() => handleWhatsappCheckout()} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg transition-colors">
                        Checkout via Whatsapp <ArrowRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onLoginSuccess={(freshUser) => {
                    setShowAuthModal(false);
                    handleWhatsappCheckout(freshUser);
                }}
            />
        </div>
    );
}
