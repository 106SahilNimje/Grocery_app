import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({
    userToken: null,
    userData: null,
    isLoading: true,
    login: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadToken();
    }, []);

    const loadToken = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const user = await AsyncStorage.getItem('userData');
            setUserToken(token);
            if (user) {
                setUserData(JSON.parse(user));
            }
        } catch (e) {
            console.error('Failed to load token', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (token, user) => {
        try {
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(user));
            setUserToken(token);
            setUserData(user);
        } catch (e) {
            console.error('Failed to save token', e);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            setUserToken(null);
            setUserData(null);
        } catch (e) {
            console.error('Failed to remove token', e);
        }
    };

    return (
        <AuthContext.Provider value={{ userToken, userData, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
