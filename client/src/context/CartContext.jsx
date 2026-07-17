import { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('mk_printers_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error parsing saved cart:', error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('mk_printers_cart', JSON.stringify(cart));
        } catch (error) {
            console.error("Failed to save to local storage", error);
        }
    }, [cart]);

    const addToCart = (product, customImage = null, quantity = 1, variants = {}) => {
        setCart((prevCart) => {
            // Check if the exact same product with the EXACT SAME specs is already in the cart
            const existingItemIndex = prevCart.findIndex(
                (item) =>
                    item._id === product._id &&
                    item.customImage === customImage &&
                    JSON.stringify(item.variants) === JSON.stringify(variants) // Compares the variant configurations
            );

            if (existingItemIndex > -1) {
                // if it's the exact same configuration, just increase the quantity
                const newCart = [...prevCart];
                newCart[existingItemIndex] = {
                    ...newCart[existingItemIndex],
                    quantity: newCart[existingItemIndex].quantity + quantity,
                };
                return newCart;
            } else {
                // if it's a new product or a different variation (e.g. different size), add as a new row
                return [...prevCart, { ...product, customImage, variants, quantity }];
            }
        });
    };

    const removeFromCart = (indexToRemove) => {
        setCart((prevCart) => prevCart.filter((_, index) => index !== indexToRemove));
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        // because we pass the calculated currentPrice as basePrice from CustomerProduct, this math remains perfectly accurate
        return cart.reduce((total, item) => total + (item.basePrice * item.quantity), 0);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getCartTotal }}>
            {children}
        </CartContext.Provider>
    );
}