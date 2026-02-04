import { Platform } from 'react-native';

const API_URL = Platform.select({
    ios: 'http://10.107.238.3:5000/api', // Simulator
    android: 'http://10.107.238.3:5000/api', // Emulator
});

export const Config = {
    API_URL,
};
