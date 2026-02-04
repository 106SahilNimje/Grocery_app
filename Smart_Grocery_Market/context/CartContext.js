import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        loadCart();
    }, []);

    useEffect(() => {
        saveCart();
    }, [cartItems]);

    const loadCart = async () => {
        try {
            const storedCart = await AsyncStorage.getItem('userCart');
            if (storedCart) {
                setCartItems(JSON.parse(storedCart));
            }
        } catch (error) {
            console.error("Failed to load cart", error);
        }
    };

    const saveCart = async () => {
        try {
            await AsyncStorage.setItem('userCart', JSON.stringify(cartItems));
        } catch (error) {
            console.error("Failed to save cart", error);
        }
    };

    const addToCart = (product, variant = null, quantity = 1) => {
        setCartItems(prevItems => {
            // Create a unique ID for the cart item (combining product ID and variant ID/unit)
            const uniqueId = variant ? `${product._id}-${variant.unit}` : product._id;

            const existingItemIndex = prevItems.findIndex(item =>
                (variant ? (item.productId === product._id && item.variant?.unit === variant.unit) : item.productId === product._id)
            );

            if (existingItemIndex > -1) {
                // Item exists, update quantity
                const newItems = [...prevItems];
                newItems[existingItemIndex].quantity += quantity;
                return newItems;
            } else {
                // Add new item
                return [...prevItems, {
                    cartId: uniqueId,
                    productId: product._id || product.id,
                    name: product.name,
                    price: variant ? variant.price : product.price,
                    image: product.image,
                    quantity: quantity,
                    variant: variant,
                    unit: variant ? variant.unit : product.unit
                }];
            }
        });
    };

    const removeFromCart = (cartId) => {
        setCartItems(prevItems => prevItems.filter(item => item.cartId !== cartId));
    };

    const updateQuantity = (cartId, quantity) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.cartId === cartId ? { ...item, quantity: Math.max(1, quantity) } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
