import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Config } from '../../constants/Config';

export default function ScanScreen() {
    const [loading, setLoading] = useState(false);

    const pickImage = async (useCamera = false) => {
        try {
            let result;
            if (useCamera) {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission denied', 'Camera access is required to scan lists');
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    quality: 0.8,
                });
            } else {
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    quality: 0.8,
                });
            }

            if (!result.canceled && result.assets && result.assets[0].uri) {
                uploadImage(result.assets[0].uri, result.assets[0]);
            }
        } catch (error) {
            console.error('Pick Image Error:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const uploadImage = async (uri, asset) => {
        setLoading(true);
        console.log("Starting upload to:", `${Config.API_URL}/ai/ocr-image`);
        console.log("Image URI:", uri);

        try {
            const formData = new FormData();
            formData.append('image', {
                uri: uri,
                name: asset.fileName || 'grocery_list.jpg',
                type: asset.mimeType || 'image/jpeg',
            });

            const response = await fetch(`${Config.API_URL}/ai/ocr-image`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data', // Try explicit, though sometimes risky in RN
                },
            });

            console.log("Response Status:", response.status);
            const data = await response.json();

            if (response.ok) {
                console.log("Upload Success:", data);
                router.push({
                    pathname: '/assistant',
                    params: { rawText: data.raw_text }
                });
            } else {
                console.error("Server Error:", data);
                throw new Error(data.error || 'Failed to extract text');
            }
        } catch (error) {
            console.error('Upload Error Details:', error);
            Alert.alert(
                'Upload Failed',
                `Could not upload image.\n\nCheck:\n1. Wi-Fi connection\n2. Server IP in Config.js (${Config.API_URL})\n3. Backend is running`
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan Grocery List</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#22C55E" />
                    <Text style={styles.loadingText}>Analyzing your list...</Text>
                    <Text style={styles.loadingSubtext}>Our AI is extracting items from the image</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.card}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="camera" size={40} color="#22C55E" />
                        </View>

                        <Text style={styles.cardTitle}>Upload Your Grocery List</Text>
                        <Text style={styles.cardSubtitle}>
                            Take a photo or upload an image of your handwritten or printed grocery list. We'll automatically add matching items to your cart.
                        </Text>

                        <TouchableOpacity style={styles.primaryButton} onPress={() => pickImage(true)}>
                            <Ionicons name="camera" size={24} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.primaryButtonText}>Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton} onPress={() => pickImage(false)}>
                            <Ionicons name="image" size={24} color="#11181C" style={{ marginRight: 8 }} />
                            <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tipsCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                            <Ionicons name="information-circle" size={20} color="#3B82F6" />
                            <Text style={styles.tipsTitle}>Tips for best results</Text>
                        </View>
                        <Text style={styles.tipText}>• Ensure good lighting</Text>
                        <Text style={styles.tipText}>• Keep text clear and readable</Text>
                        <Text style={styles.tipText}>• Avoid shadows on the list</Text>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        backgroundColor: '#22C55E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#11181C',
    },
    loadingSubtext: {
        marginTop: 8,
        fontSize: 14,
        color: '#687076',
        textAlign: 'center',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#11181C',
        marginBottom: 12,
        textAlign: 'center',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#687076',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    primaryButton: {
        backgroundColor: '#22C55E',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    secondaryButton: {
        backgroundColor: '#F3F4F6',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#11181C',
        fontWeight: 'bold',
        fontSize: 16,
    },
    tipsCard: {
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#DBEAFE'
    },
    tipsTitle: {
        fontWeight: 'bold',
        color: '#1E40AF',
        marginLeft: 8,
        fontSize: 16,
    },
    tipText: {
        color: '#1E3A8A',
        fontSize: 14,
        marginBottom: 6,
        marginLeft: 28,
    }
});
