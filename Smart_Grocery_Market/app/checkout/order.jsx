import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';
import { Config } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function OrderSummaryScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { userData } = useAuth();

    // Parse address from params
    const [address, setAddress] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (params.address) {
            try {
                setAddress(JSON.parse(params.address));
            } catch (e) {
                console.error("Error parsing address:", e);
                Alert.alert("Error", "Invalid address data.");
                router.back();
            }
        }
    }, [params.address]);

    const getImageUrl = (url) => {
        if (!url) return 'https://placehold.co/100';
        if (url.includes('localhost')) {
            const baseUrl = Config.API_URL.replace('/api', '');
            return url.replace('http://localhost:5000', baseUrl);
        }
        return url;
    };

    const handlePlaceOrder = async () => {
        if (!userData) {
            Alert.alert("Login Required", "Please login to place an order", [
                { text: "Login", onPress: () => router.push('/auth/login') },
                { text: "Cancel" }
            ]);
            return;
        }

        const userId = userData._id || userData.id;
        if (!userId) {
            Alert.alert("Error", "User ID is missing. Please log out and log in again.");
            return;
        }

        const invalidItems = cartItems.filter(item => !item.productId);
        if (invalidItems.length > 0) {
            Alert.alert("Error", "Some items in cart have invalid data. Please clear cart and try again.");
            return;
        }

        setLoading(true);

        try {
            const totalAmount = getCartTotal();
            const deliveryCharge = totalAmount > 500 ? 0 : 40;
            const finalTotal = totalAmount + deliveryCharge;

            const orderData = {
                user: userId,
                items: cartItems.map(item => ({
                    product: item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: finalTotal,
                shippingAddress: `${address.name}, ${address.houseNo}, ${address.street}, ${address.city}, ${address.pincode} - ${address.phone}`
            };

            console.log("Sending Order Payload:", JSON.stringify(orderData));

            const response = await axios.post(`${Config.API_URL}/orders`, orderData);

            if (response.status === 201) {
                Alert.alert(
                    "Order Placed!",
                    "Your order has been placed successfully. Thank you for shopping with us.",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                clearCart();
                                router.replace('/(tabs)/orders');
                            }
                        }
                    ]
                );
            }
        } catch (error) {
            console.error("Place Order Error:", error);
            if (error.response) {
                console.error("Server Error Data:", error.response.data);
                Alert.alert("Error", `Failed to place order: ${error.response.data.error || "Server Error"}`);
            } else {
                Alert.alert("Error", "Failed to place order. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!address) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#22C55E" />
            </View>
        );
    }

    const totalAmount = getCartTotal();
    const deliveryCharge = totalAmount > 500 ? 0 : 40;
    const finalTotal = totalAmount + deliveryCharge;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#11181C" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Summary</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Delivery Address Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Deliver to</Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={styles.editButton}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.addressCard}>
                        <View style={styles.addressIcon}>
                            <Ionicons name="location" size={24} color="#22C55E" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.addressName}>{address.name}</Text>
                            <Text style={styles.addressText}>
                                {address.houseNo}, {address.street}
                            </Text>
                            <Text style={styles.addressText}>
                                {address.city}, {address.pincode}
                            </Text>
                            <Text style={styles.addressPhone}>Phone: {address.phone}</Text>
                        </View>
                    </View>
                </View>

                {/* Items Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Items ({cartItems.length})</Text>
                    <View style={styles.itemsCard}>
                        {cartItems.map((item) => (
                            <View key={item.cartId} style={styles.itemRow}>
                                <View style={styles.itemImageContainer}>
                                    <Image source={{ uri: getImageUrl(item.image) }} style={styles.itemImage} />
                                    <View style={styles.qtyBadge}>
                                        <Text style={styles.qtyBadgeText}>{item.quantity}</Text>
                                    </View>
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                    <Text style={styles.itemVariant}>
                                        {item.variant ? item.variant.unit : item.unit || 'Standard'}
                                    </Text>
                                </View>
                                <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.paymentCard}>
                        <Ionicons name="cash-outline" size={24} color="#22C55E" />
                        <Text style={styles.paymentText}>Cash upon Delivery</Text>
                        <Ionicons name="checkmark-circle" size={24} color="#22C55E" style={{ marginLeft: 'auto' }} />
                    </View>
                </View>

                {/* Bill Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bill Details</Text>
                    <View style={styles.billCard}>
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Item Total</Text>
                            <Text style={styles.billValue}>₹{totalAmount}</Text>
                        </View>
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Delivery Charge</Text>
                            <Text style={[styles.billValue, deliveryCharge === 0 && { color: '#22C55E' }]}>
                                {deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.billRow}>
                            <Text style={styles.totalLabel}>To Pay</Text>
                            <Text style={styles.totalValue}>₹{finalTotal}</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <View>
                    <Text style={styles.footerTotalLabel}>Total Amount</Text>
                    <Text style={styles.footerTotalValue}>₹{finalTotal}</Text>
                </View>
                <TouchableOpacity
                    style={styles.placeOrderButton}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <Text style={styles.placeOrderText}>Place Order</Text>
                            <Ionicons name="chevron-forward" size={20} color="white" />
                        </>
                    )}
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
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#11181C',
    },
    content: {
        padding: 16,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#11181C',
        marginBottom: 12,
    },
    editButton: {
        color: '#22C55E',
        fontWeight: '600',
        fontSize: 14,
    },
    addressCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    addressIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#DCFCE7',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    addressName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#11181C',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 2,
        lineHeight: 20,
    },
    addressPhone: {
        fontSize: 14,
        color: '#11181C',
        marginTop: 4,
        fontWeight: '500',
    },
    itemsCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    itemImageContainer: {
        position: 'relative',
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemImage: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    qtyBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#11181C',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    qtyBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#11181C',
    },
    itemVariant: {
        fontSize: 12,
        color: '#6B7280',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#11181C',
    },
    paymentCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#22C55E',
        backgroundColor: '#F0FDF4',
    },
    paymentText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#11181C',
        marginLeft: 12,
    },
    billCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    billLabel: {
        fontSize: 14,
        color: '#4B5563',
    },
    billValue: {
        fontSize: 14,
        color: '#11181C',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#11181C',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#22C55E',
    },
    footer: {
        backgroundColor: 'white',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    footerTotalLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    footerTotalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#11181C',
    },
    placeOrderButton: {
        backgroundColor: '#22C55E',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    placeOrderText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    }
});
