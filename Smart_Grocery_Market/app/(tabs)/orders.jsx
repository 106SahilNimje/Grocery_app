import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, View, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Config } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from 'expo-router';

export default function OrdersScreen() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { userData } = useAuth();

    const fetchOrders = async () => {
        if (!userData) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${Config.API_URL}/orders?userId=${userData._id || userData.id}`);
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [userData]);

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [userData])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchOrders();
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getImageUrl = (url) => {
        if (!url) return 'https://placehold.co/100';
        if (url.includes('localhost')) {
            const baseUrl = Config.API_URL.replace('/api', '');
            return url.replace('http://localhost:5000', baseUrl);
        }
        return url;
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#22C55E" />
            </SafeAreaView>
        );
    }

    if (!userData) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <Text>Please login to view orders.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Orders</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#22C55E']} />
                }
            >
                {orders.length === 0 ? (
                    <View style={styles.center}>
                        <Text style={{ marginTop: 20, color: '#666' }}>No orders found.</Text>
                    </View>
                ) : (
                    orders.map((order) => (
                        <View key={order._id} style={styles.orderCard}>
                            <View style={styles.orderHeader}>
                                <View>
                                    <Text style={styles.orderId}>Order ID: #{order._id.slice(-6).toUpperCase()}</Text>
                                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                                </View>
                                <View style={[styles.statusBadge,
                                order.orderStatus === 'Cancelled' ? { backgroundColor: '#FEF2F2' } :
                                    order.orderStatus === 'Processing' ? { backgroundColor: '#EFF6FF' } : {}
                                ]}>
                                    <Text style={[styles.statusText,
                                    order.orderStatus === 'Cancelled' ? { color: '#EF4444' } :
                                        order.orderStatus === 'Processing' ? { color: '#3B82F6' } : {}
                                    ]}>{order.orderStatus}</Text>
                                </View>
                            </View>

                            <View style={styles.orderItems}>
                                <View style={{ flexDirection: 'row' }}>
                                    {order.items.slice(0, 3).map((item, index) => (
                                        <View key={index} style={styles.itemImageContainer}>
                                            <Image
                                                source={{ uri: item.product && item.product.image ? getImageUrl(item.product.image) : 'https://placehold.co/100' }}
                                                style={styles.itemImage}
                                            />
                                        </View>
                                    ))}
                                </View>
                                {order.items.length > 3 && (
                                    <View style={styles.moreItemsBadge}>
                                        <Text style={styles.moreItemsText}>+{order.items.length - 3}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.orderFooter}>
                                <Text style={styles.itemCount}>{order.items.length} items</Text>
                                <Text style={styles.totalPrice}>₹{order.totalAmount}</Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#22C55E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    orderId: {
        fontSize: 14,
        color: '#687076',
        fontWeight: '500',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 12,
        color: '#889096',
    },
    statusBadge: {
        backgroundColor: '#F0FDF4',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    statusText: {
        color: '#22C55E',
        fontSize: 12,
        fontWeight: 'bold',
    },
    orderItems: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        justifyContent: 'space-between'
    },
    itemImageContainer: {
        width: 50,
        height: 50,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6'
    },
    itemImage: {
        width: 30,
        height: 30,
        resizeMode: 'contain'
    },
    moreItemsBadge: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    moreItemsText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#687076'
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
    },
    itemCount: {
        fontSize: 14,
        color: '#687076',
    },
    totalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#11181C',
    }
});
