import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SplashScreen() {
    const { userToken, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            console.log('Auth loaded, redirecting...', { userToken });
            if (userToken) {
                router.replace('/(tabs)');
            } else {
                router.replace('/auth/login');
            }
        }
    }, [isLoading, userToken]);

    const handleGetStarted = () => {
        if (userToken) {
            router.replace('/(tabs)');
        } else {
            router.replace('/auth/login');
        }
    };

    return (
        <LinearGradient colors={['#4ADE80', '#22C55E']} style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Smart Grocery Market</Text>
                <Text style={styles.subtitle}>
                    {isLoading ? "Checking authentication..." : "Your Daily Needs, Delivered Smartly"}
                </Text>

                <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>

                {isLoading && (
                    <Text style={{ marginTop: 20, color: 'white', opacity: 0.7 }}>
                        Taking too long? Tap "Get Started"
                    </Text>
                )}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 30,
        textAlign: 'center',
    },
    button: {
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        alignItems: 'center',
    },
    buttonText: {
        color: '#22C55E',
        fontSize: 18,
        fontWeight: 'bold',
    },
});


