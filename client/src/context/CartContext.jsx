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

    const addToCart = (product, customImage = null, quantity = 1, customBaseColor = '#ffffff') => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex(
                (item) =>
                    item._id === product._id &&
                    item.customImage === customImage &&
                    item.customBaseColor === customBaseColor
            );

            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex] = {
                    ...newCart[existingItemIndex],
                    quantity: newCart[existingItemIndex].quantity + quantity,
                };
                return newCart;
            } else {
                return [...prevCart, { ...product, customImage, customBaseColor, quantity }];
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
        return cart.reduce((total, item) => total + (item.basePrice * item.quantity), 0);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getCartTotal }}>
            {children}
        </CartContext.Provider>
    );
}