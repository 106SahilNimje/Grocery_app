import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Config } from '../../constants/Config';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddressScreen() {
    const router = useRouter();
    const { userData } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        houseNo: '',
        street: '',
        city: '',
        pincode: '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userData?._id || userData?.uid) {
            fetchAddress();
        }
    }, [userData]);

    const fetchAddress = async () => {
        try {
            // Try fetching from backend first
            const userId = userData._id || userData.uid; // Fallback for safety
            if (!userId) return;

            const response = await axios.get(`${Config.API_URL}/users/address/${userId}`);
            if (response.data.address) {
                setFormData(response.data.address);
            }
        } catch (error) {
            console.log("No saved address found or error fetching:", error.message);
        }
    };

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        let valid = true;
        let newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.phone.trim() || formData.phone.length < 10) newErrors.phone = 'Valid phone number is required';
        if (!formData.houseNo.trim()) newErrors.houseNo = 'House/Flat No. is required';
        if (!formData.street.trim()) newErrors.street = 'Street/Area is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.pincode.trim() || formData.pincode.length < 6) newErrors.pincode = 'Valid Pincode is required';

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async () => {
        if (validate()) {
            setLoading(true);
            try {
                const userId = userData?._id || userData?.uid;
                if (userId) {
                    // Save address to backend for persistence
                    await axios.post(`${Config.API_URL}/users/address`, {
                        uid: userId,
                        address: formData
                    });
                }

                router.push({
                    pathname: '/checkout/order',
                    params: { address: JSON.stringify(formData) }
                });
            } catch (error) {
                console.error("Error saving address:", error);
                // Proceed anyway so user isn't invalid blocked, just verify on next screen
                router.push({
                    pathname: '/checkout/order',
                    params: { address: JSON.stringify(formData) }
                });
            } finally {
                setLoading(false);
            }
        } else {
            Alert.alert('Error', 'Please fill all required fields correctly.');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#11181C" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivery Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    <Text style={styles.sectionTitle}>Contact Info</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={[styles.input, errors.name && styles.inputError]}
                            placeholder="John Doe"
                            value={formData.name}
                            onChangeText={(text) => handleChange('name', text)}
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, errors.phone && styles.inputError]}
                            placeholder="9876543210"
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={formData.phone}
                            onChangeText={(text) => handleChange('phone', text)}
                        />
                        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                    </View>

                    <Text style={styles.sectionTitle}>Address Info</Text>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>House No / Flat</Text>
                            <TextInput
                                style={[styles.input, errors.houseNo && styles.inputError]}
                                placeholder="A-101"
                                value={formData.houseNo}
                                onChangeText={(text) => handleChange('houseNo', text)}
                            />
                            {errors.houseNo && <Text style={styles.errorText}>{errors.houseNo}</Text>}
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Pincode</Text>
                            <TextInput
                                style={[styles.input, errors.pincode && styles.inputError]}
                                placeholder="400001"
                                keyboardType="number-pad"
                                maxLength={6}
                                value={formData.pincode}
                                onChangeText={(text) => handleChange('pincode', text)}
                            />
                            {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Street / Area / Colony</Text>
                        <TextInput
                            style={[styles.input, errors.street && styles.inputError]}
                            placeholder="Near Main Market, MG Road"
                            value={formData.street}
                            onChangeText={(text) => handleChange('street', text)}
                        />
                        {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>City</Text>
                        <TextInput
                            style={[styles.input, errors.city && styles.inputError]}
                            placeholder="Mumbai"
                            value={formData.city}
                            onChangeText={(text) => handleChange('city', text)}
                        />
                        {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Save & Proceed</Text>
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
        padding: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#11181C',
        marginBottom: 16,
        marginTop: 8,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4B5563',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#11181C',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    row: {
        flexDirection: 'row',
    },
    footer: {
        backgroundColor: 'white',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    submitButton: {
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
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    }
});
