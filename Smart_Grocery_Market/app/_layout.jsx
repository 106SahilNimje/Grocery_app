import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { useColorScheme } from '../hooks/use-color-scheme';

export const unstable_settings = {
    anchor: '(tabs)',
};

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <AuthProvider>
            <CartProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="auth" options={{ headerShown: false }} />
                        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="checkout" options={{ headerShown: false }} />
                        <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
                    </Stack>
                    <StatusBar style="auto" />
                </ThemeProvider>
            </CartProvider>
        </AuthProvider>
    );
}
