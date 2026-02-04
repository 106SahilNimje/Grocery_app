import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { Config } from '../../constants/Config';
import { useCart } from '../../context/CartContext';

const VARIANTS = ['250g', '500g', '1kg'];

const RELATED_PRODUCTS = [
    { id: 2, name: 'Red Onions', price: 35, image: 'https://img.icons8.com/color/480/onion.png' },
    { id: 3, name: 'Fresh Potatoes', price: 30, image: 'https://img.icons8.com/color/480/potato.png' },
    { id: 5, name: 'Organic Carrots', price: 45, image: 'https://img.icons8.com/color/480/carrot.png' },
];

export default function ProductDetails() {
    const { id } = useLocalSearchParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, selectedVariant, quantity);
        Alert.alert("Success", `${product.name} added to cart!`);
    };

    useEffect(() => {
        if (id) {
            fetchProductDetails();
        }
    }, [id]);

    const fetchProductDetails = async () => {
        try {
            const response = await axios.get(`${Config.API_URL}/products/${id}`);
            const data = response.data;
            setProduct(data);
            if (data.variants && data.variants.length > 0) {
                setSelectedVariant(data.variants[0]);
            }
        } catch (error) {
            console.error("Error fetching product details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const increment = () => setQuantity(q => q + 1);
    const decrement = () => setQuantity(q => q > 1 ? q - 1 : 1);

    const getImageUrl = (url) => {
        if (!url) return 'https://placehold.co/400';
        // Replace localhost with the IP from Config
        if (url.includes('localhost')) {
            const baseUrl = Config.API_URL.replace('/api', '');
            return url.replace('http://localhost:5000', baseUrl);
        }
        return url;
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#22C55E" />
            </SafeAreaView>
        );
    }

    if (!product) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <Stack.Screen options={{ headerShown: false }} />
                <Text>Product not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color="#11181C" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="heart-outline" size={24} color="#11181C" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: getImageUrl(product.image) }}
                        style={styles.productImage}
                        onError={(e) => console.log("Image Load Error:", e.nativeEvent.error)}
                    />
                </View>

                {/* Product Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>
                        ₹{selectedVariant ? selectedVariant.price : product.price}
                    </Text>

                    {product.variants && product.variants.length > 0 && (
                        <>
                            <Text style={styles.sectionLabel}>Select Variant</Text>
                            <View style={styles.variantsContainer}>
                                {product.variants.map((variant, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.variantBadge,
                                            selectedVariant === variant && styles.variantBadgeSelected
                                        ]}
                                        onPress={() => setSelectedVariant(variant)}
                                    >
                                        <Text style={[
                                            styles.variantText,
                                            selectedVariant === variant && styles.variantTextSelected
                                        ]}>{variant.unit}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}

                    <Text style={styles.sectionLabel}>Quantity</Text>
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity style={styles.qtyButton} onPress={decrement}>
                            <Ionicons name="remove" size={20} color="#11181C" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{quantity}</Text>
                        <TouchableOpacity style={[styles.qtyButton, styles.qtyButtonActive]} onPress={increment}>
                            <Ionicons name="add" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.stockContainer}>
                        <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                        <Text style={styles.stockText}>In Stock - Available for delivery</Text>
                    </View>


                    <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                    </TouchableOpacity>

                    {/* Description */}
                    {product.description && (
                        <View style={{ marginBottom: 20 }}>
                            <Text style={styles.sectionHeader}>Description</Text>
                            <Text style={{ color: '#4B5563', lineHeight: 20 }}>{product.description}</Text>
                        </View>
                    )}

                    {/* Related Products */}
                    <Text style={styles.sectionHeader}>Related Products</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relatedScroll}>
                        {RELATED_PRODUCTS.map(p => (
                            <View key={p.id} style={styles.relatedCard}>
                                <View style={styles.relatedImageContainer}>
                                    <Image source={{ uri: p.image }} style={styles.relatedImage} />
                                </View>
                                <Text style={styles.relatedName}>{p.name}</Text>
                                <Text style={styles.relatedPrice}>₹{p.price}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingBottom: 40,
    },
    imageContainer: {
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        marginBottom: 20,
    },
    productImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    infoContainer: {
        paddingHorizontal: 20,
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#11181C',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#22C55E',
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 14,
        color: '#687076',
        fontWeight: '600',
        marginBottom: 12,
    },
    variantsContainer: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    variantBadge: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        marginRight: 12,
    },
    variantBadgeSelected: {
        backgroundColor: '#22C55E',
    },
    variantText: {
        color: '#11181C',
        fontWeight: '600',
    },
    variantTextSelected: {
        color: 'white',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    qtyButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyButtonActive: {
        backgroundColor: '#22C55E',
    },
    qtyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 16,
        color: '#11181C',
    },
    stockContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    stockText: {
        color: '#22C55E',
        fontWeight: '500',
        marginLeft: 8,
    },
    addToCartButton: {
        backgroundColor: '#22C55E',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    addToCartText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#11181C',
        marginBottom: 16,
    },
    relatedScroll: {
        paddingBottom: 20,
    },
    relatedCard: {
        width: 120,
        marginRight: 16,
    },
    relatedImageContainer: {
        width: 120,
        height: 120,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    relatedImage: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
    },
    relatedName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#11181C',
        marginBottom: 4,
    },
    relatedPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#22C55E',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    }
});
