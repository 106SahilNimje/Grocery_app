import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LocationModal from '../../components/LocationModal';
import { useCart } from '../../context/CartContext';

import axios from 'axios';
import { Config } from '../../constants/Config';

// ... (existing imports)

const FEATURED_PRODUCTS = [
    {
        id: 1,
        name: 'Fresh Tomatoes',
        weight: '500g',
        price: 40,
        image: 'https://img.icons8.com/color/480/tomato.png',
        bgColor: '#FFFFFF'
    },
    {
        id: 2,
        name: 'Red Onions',
        weight: '1kg',
        price: 35,
        image: 'https://img.icons8.com/color/480/onion.png',
        bgColor: '#FFFFFF'
    },
    {
        id: 3,
        name: 'Fresh Potatoes',
        weight: '1kg',
        price: 30,
        image: 'https://img.icons8.com/color/480/potato.png',
        bgColor: '#FFFFFF'
    },
    {
        id: 4,
        name: 'Organic Carrots',
        weight: '500g',
        price: 45,
        image: 'https://img.icons8.com/color/480/carrot.png',
        bgColor: '#FFFFFF'
    },
];

export default function HomeScreen() {
    const [location, setLocation] = useState('Detecting...');
    const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
    const [categories, setCategories] = useState([]);
    const { addToCart } = useCart();

    const [products, setProducts] = useState(FEATURED_PRODUCTS); // Fallback to initial data if needed, or empty array

    useEffect(() => {
        loadSavedLocation();
        fetchCategories();
        fetchProducts();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${Config.API_URL}/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${Config.API_URL}/products`);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    // ... (existing imports)

    const loadSavedLocation = async () => {
        try {
            const savedLocation = await AsyncStorage.getItem('userLocation');
            if (savedLocation) {
                setLocation(savedLocation);
            } else {
                getCurrentLocation();
            }
        } catch (error) {
            console.error('Error loading location:', error);
            getCurrentLocation();
        }
    };

    const getCurrentLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Allow location access to show nearby stores');
                setLocation('Mumbai, Maharashtra'); // Default
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = loc.coords;

            // Reverse Geocoding
            let reverseGeocode = await Location.reverseGeocodeAsync({
                latitude,
                longitude
            });

            if (reverseGeocode.length > 0) {
                const address = reverseGeocode[0];
                const city = address.city || address.district || address.subregion || 'Unknown City';
                const region = address.region || 'Maharashtra';
                const formattedLocation = `${city}, ${region}`;
                setLocation(formattedLocation);
                await AsyncStorage.setItem('userLocation', formattedLocation);
            }
        } catch (error) {
            console.error('Error getting location:', error);
            setLocation('Mumbai, Maharashtra');
        }
    };

    const handleSelectManualLocation = async (city) => {
        const fullLocation = `${city}, India`;
        setLocation(fullLocation);
        await AsyncStorage.setItem('userLocation', fullLocation);
        setIsLocationModalVisible(false);
    };

    const handleUseCurrentLocation = () => {
        setIsLocationModalVisible(false);
        getCurrentLocation();
    };

    const handleProductPress = (id) => {
        router.push(`/product/${id}`);
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        // Replace localhost with the IP from Config
        if (url.includes('localhost')) {
            const baseUrl = Config.API_URL.replace('/api', '');
            return url.replace('http://localhost:5000', baseUrl);
        }
        return url;
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.headerBackground}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.locationContainer} onPress={() => setIsLocationModalVisible(true)}>
                        <Ionicons name="location" size={24} color="white" />
                        <View style={{ marginLeft: 8 }}>
                            <Text style={styles.deliverToText}>Deliver to</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.locationText}>{location}</Text>
                                <Ionicons name="chevron-down" size={16} color="white" style={{ marginLeft: 4 }} />
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color="#22C55E" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        placeholder="Search for vegetables, fruits..."
                        style={styles.searchInput}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Categories */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Shop by Category</Text>
                </View>
                <View style={styles.categoriesContainer}>
                    {categories.map((cat) => (
                        <View key={cat._id} style={styles.categoryItem}>
                            <View style={[styles.categoryIcon, { backgroundColor: cat.iconBg || '#E5E7EB' }]}>
                                {cat.icon?.length > 2 ? (
                                    <Ionicons name={cat.icon} size={24} color={cat.iconColor || '#111827'} />
                                ) : (
                                    <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
                                )}
                            </View>
                            <Text style={styles.categoryName}>{cat.name}</Text>
                        </View>
                    ))}
                </View>

                {/* ... (existing banner and products) */}

                {/* Banner */}
                <LinearGradient
                    colors={['#FF8C42', '#FACC15', '#EC4899']} // Gradient similar to screenshot
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.banner}
                >
                    <View>
                        <Text style={styles.bannerTitle}>Mega Sale!</Text>
                        <Text style={styles.bannerSubtitle}>Get up to 50% off on fresh vegetables</Text>
                        <TouchableOpacity style={styles.shopNowButton}>
                            <Text style={styles.shopNowText}>Shop Now</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>



                {/* Featured Products */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Featured Products</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.productsGrid}>
                    {products.map((product) => (
                        <TouchableOpacity
                            key={product._id || product.id}
                            style={styles.productCard}
                            onPress={() => handleProductPress(product._id || product.id)}
                        >
                            <View style={styles.productImageContainer}>
                                <Image source={{ uri: getImageUrl(product.image) }} style={styles.productImage} />
                            </View>
                            <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                            {/* Display first variant unit if available */}
                            <Text style={styles.productWeight}>
                                {product.variants && product.variants.length > 0 ? product.variants[0].unit : (product.unit || '')}
                            </Text>

                            <View style={styles.productFooter}>
                                <Text style={styles.productPrice}>₹{product.price}</Text>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => {
                                        addToCart(product, product.variants ? product.variants[0] : null, 1);
                                        Alert.alert("Success", "Added to cart!");
                                    }}
                                >
                                    <Ionicons name="add" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Added extra padding at bottom for content to be visible above tabs */}
                <View style={{ height: 100 }} />

            </ScrollView>

            <LocationModal
                visible={isLocationModalVisible}
                onClose={() => setIsLocationModalVisible(false)}
                onSelectLocation={handleSelectManualLocation}
                onUseCurrentLocation={handleUseCurrentLocation}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    headerBackground: {
        backgroundColor: '#22C55E',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deliverToText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    },
    locationText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    notificationButton: {
        backgroundColor: 'white',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
        color: '#11181C',
    },
    scrollContent: {
        paddingTop: 20,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#11181C',
    },
    viewAllText: {
        color: '#22C55E',
        fontWeight: '600',
    },
    categoriesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    categoryItem: {
        alignItems: 'center',
        // width: '23%',
    },
    categoryIcon: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '500',
    },
    banner: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
    },
    bannerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    bannerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 16,
    },
    shopNowButton: {
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    shopNowText: {
        color: '#F97316', // Orange matching gradient
        fontWeight: 'bold',
        fontSize: 14,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    productCard: {
        backgroundColor: 'white',
        width: '48%',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    productImageContainer: {
        height: 100,
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    productImage: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#11181C',
        marginBottom: 4,
    },
    productWeight: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 12,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#22C55E',
    },
    addButton: {
        backgroundColor: '#22C55E',
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});


