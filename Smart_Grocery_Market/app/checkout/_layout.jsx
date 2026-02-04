import { Stack } from 'expo-router';

export default function CheckoutLayout() {
    return (
        <Stack>
            <Stack.Screen name="address" options={{ headerShown: false }} />
            <Stack.Screen name="order" options={{ headerShown: false }} />
        </Stack>
    );
}
