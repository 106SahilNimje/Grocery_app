import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
    const { logout, userData } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out of your account?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    onPress: async () => {
                        await logout();
                        router.replace('/auth/login');
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    const menuItems = [
        { id: '1', title: 'My Orders', subtitle: 'View order history', icon: 'bag-handle-outline', color: '#E8F5E9', iconColor: '#4CAF50' },
        { id: '2', title: 'Saved Addresses', subtitle: 'Manage delivery addresses', icon: 'location-outline', color: '#E3F2FD', iconColor: '#2196F3' },
        { id: '3', title: 'Payment Methods', subtitle: 'Manage payment options', icon: 'card-outline', color: '#F3E5F5', iconColor: '#9C27B0' },
        { id: '4', title: 'Help & Support', subtitle: 'Get assistance', icon: 'headset-outline', color: '#FFF3E0', iconColor: '#FF9800' },
        { id: '5', title: 'Terms & Privacy Policy', subtitle: 'Legal information', icon: 'document-text-outline', color: '#ECEFF1', iconColor: '#607D8B' },
        { id: '6', title: 'Logout', subtitle: 'Sign out of your account', icon: 'log-out-outline', color: '#FFEBEE', iconColor: '#F44336', isLogout: true },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* User Info Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={40} color="#4CAF50" />
                        </View>
                    </View>
                    <Text style={styles.userName}>{userData?.displayName || 'User'}</Text>
                    <Text style={styles.userPhone}>+91 98765 43210</Text>
                    <Text style={styles.userEmail}>{userData?.email || 'user@email.com'}</Text>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={
                                item.isLogout ? handleLogout :
                                    item.id === '1' ? () => router.push('/(tabs)/orders') :
                                        item.id === '2' ? () => router.push('/profile/saved-addresses') :
                                            () => { }
                            }
                        >
                            <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                                <Ionicons name={item.icon} size={24} color={item.iconColor} />
                            </View>
                            <View style={styles.menuTextContent}>
                                <Text style={styles.menuItemTitle}>{item.title}</Text>
                                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        backgroundColor: '#4CAF50',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    scrollContent: {
        paddingBottom: 30,
    },
    profileCard: {
        backgroundColor: '#fff',
        margin: 20,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    userPhone: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
        color: '#888',
    },
    menuContainer: {
        paddingHorizontal: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 1,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuTextContent: {
        flex: 1,
    },
    menuItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    menuItemSubtitle: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
});
