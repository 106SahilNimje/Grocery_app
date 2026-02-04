import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '../../components/haptic-tab';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const tintColor = Colors[colorScheme ?? 'light'].tint;

    // Calculate tab bar height and padding based on safe area insets
    const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 85 : 70 + (insets.bottom > 0 ? insets.bottom - 10 : 0);
    const PADDING_BOTTOM = Platform.OS === 'ios' ? insets.bottom : (insets.bottom > 0 ? insets.bottom : 12);

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: tintColor,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarStyle: {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    borderTopWidth: 0,
                    elevation: 8,
                    height: TAB_BAR_HEIGHT,
                    paddingBottom: PADDING_BOTTOM,
                    paddingTop: 12,
                    position: Platform.OS === 'ios' ? 'absolute' : 'relative',
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <Ionicons size={size} name="home" color={color} />,
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: 'Scan',
                    tabBarIcon: ({ color, size }) => <Ionicons size={size} name="camera" color={color} />,
                }}
            />
            <Tabs.Screen
                name="cart"
                options={{
                    title: 'Cart',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons size={size} name="cart" color={color} />
                    ),
                    tabBarBadge: 3,
                    tabBarBadgeStyle: { backgroundColor: '#28D05F', color: 'white', fontSize: 10 },
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    tabBarIcon: ({ color, size }) => <Ionicons size={size} name="cube" color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <Ionicons size={size} name="person" color={color} />,
                }}
            />

            {/* Hidden tabs or routes */}
            <Tabs.Screen
                name="explore"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}
