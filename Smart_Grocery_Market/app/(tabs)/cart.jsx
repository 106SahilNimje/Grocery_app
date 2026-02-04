import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';
import { Config } from '../../constants/Config';
import { router } from 'expo-router';

export default function CartScreen() {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

    const getImageUrl = (url) => {
        if (!url) return 'https://placehold.co/100';
        if (url.includes('localhost')) {
            const baseUrl = Config.API_URL.replace('/api', '');
            return url.replace('http://localhost:5000', baseUrl);
        }
        return url;
    };

    const renderItem = ({ item }) => (
        <View style={styles.cartItem}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: getImageUrl(item.image) }}
                    style={styles.itemImage}
                    resizeMode="contain"
                />
            </View>
            <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemVariant}>
                    {item.variant ? item.variant.unit : item.unit || 'Standard'}
                </Text>
                <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>

            <View style={styles.actionContainer}>
                <View style={styles.quantityControls}>
                    <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => updateQuantity(item.cartId, item.quantity - 1)}
                    >
                        <Ionicons name="remove" size={16} color="#11181C" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                        style={[styles.qtyButton, styles.qtyButtonActive]}
                        onPress={() => updateQuantity(item.cartId, item.quantity + 1)}
                    >
                        <Ionicons name="add" size={16} color="white" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromCart(item.cartId)}
                >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (cartItems.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <Ionicons name="cart-outline" size={80} color="#9CA3AF" />
                    </View>
                    <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
                    <Text style={styles.emptySubtitle}>
                        Looks like you haven't added anything to your cart yet.
                    </Text>
                    <TouchableOpacity
                        style={styles.shopNowButton}
                        onPress={() => router.push('/(tabs)')}
                    >
                        <Text style={styles.shopNowText}>Shop Now</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Cart</Text>
                <Text style={styles.headerCount}>{cartItems.length} items</Text>
            </View>

            <FlatList
                data={cartItems}
                renderItem={renderItem}
                keyExtractor={item => item.cartId}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>₹{getCartTotal()}</Text>
                </View>
                <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={() => router.push('/checkout/address')}
                >
                    <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#11181C',
    },
    headerCount: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        alignItems: 'center',
    },
    imageContainer: {
        width: 70,
        height: 70,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemImage: {
        width: 50,
        height: 50,
    },
    itemDetails: {
        flex: 1,
        marginRight: 8,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#11181C',
        marginBottom: 4,
    },
    itemVariant: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#22C55E',
    },
    actionContainer: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 70,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 2,
    },
    qtyButton: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
    },
    qtyButtonActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
        backgroundColor: '#22C55E',
    },
    qtyText: {
        fontSize: 14,
        fontWeight: '600',
        marginHorizontal: 8,
        color: '#11181C',
    },
    removeButton: {
        padding: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#11181C',
    },
    checkoutButton: {
        backgroundColor: '#22C55E',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    checkoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        backgroundColor: '#F3F4F6',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#11181C',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
    },
    shopNowButton: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        backgroundColor: '#22C55E',
        borderRadius: 12,
        elevation: 2,
    },
    shopNowText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
