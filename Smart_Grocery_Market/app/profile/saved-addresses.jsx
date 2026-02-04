import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Config } from '../../constants/Config';
import axios from 'axios';

export default function SavedAddressesScreen() {
    const router = useRouter();
    const { userData } = useAuth();
    const [address, setAddress] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAddress = async () => {
        if (!userData?._id) return;
        try {
            setLoading(true);
            const response = await axios.get(`${Config.API_URL}/users/address/${userData._id}`);
            setAddress(response.data.address);
        } catch (error) {
            console.error("Error fetching address:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAddress();
        }, [])
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#11181C" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Saved Addresses</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#22C55E" style={{ marginTop: 20 }} />
                ) : !address ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="location-outline" size={80} color="#E5E7EB" />
                        <Text style={styles.emptyText}>No saved addresses found</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => router.push('/checkout/address')}
                        >
                            <Text style={styles.addButtonText}>Add New Address</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.addressCard}>
                        <View style={styles.addressHeader}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="home" size={24} color="#22C55E" />
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/checkout/address')}
                                style={styles.editButton}
                            >
                                <Ionicons name="pencil" size={16} color="#22C55E" />
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.addressDetails}>
                            <Text style={styles.name}>{address.name}</Text>
                            <Text style={styles.addressText}>{address.houseNo}, {address.street}</Text>
                            <Text style={styles.addressText}>{address.city} - {address.pincode}</Text>
                            <Text style={styles.phone}>Phone: {address.phone}</Text>
                        </View>
                    </View>
                )}
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
        flex: 1,
        padding: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 24,
    },
    addButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#22C55E',
        borderRadius: 8,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    addressCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#DCFCE7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    editText: {
        color: '#22C55E',
        fontWeight: 'bold',
        marginLeft: 4,
    },
    addressDetails: {
        marginLeft: 4,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#11181C',
        marginBottom: 8,
    },
    addressText: {
        fontSize: 15,
        color: '#4B5563',
        marginBottom: 4,
        lineHeight: 22,
    },
    phone: {
        fontSize: 15,
        color: '#11181C',
        fontWeight: '500',
        marginTop: 8,
    }
});
