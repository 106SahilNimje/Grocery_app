import axios from 'axios';
import { Config } from '../constants/Config';

const api = axios.create({
    baseURL: Config.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
    console.log('Starting Request:', request.method?.toUpperCase(), request.url);
    return request;
});

api.interceptors.response.use(response => {
    console.log('Response:', response.status, response.config.url);
    return response;
}, error => {
    console.error('API Error:', error.message);
    if (error.response) {
        console.error('Error Data:', error.response.data);
        console.error('Error Status:', error.response.status);
    }
    return Promise.reject(error);
});

export const authService = {
    signup: async (data) => {
        try {
            const response = await api.post('/auth/signup', data);
            return response.data;
        } catch (error) {
            const backendError = error.response?.data;
            if (backendError?.error) {
                throw new Error(backendError.error);
            }
            if (typeof backendError === 'string') {
                // Truncate if it's a long HTML string
                const message = backendError.length > 100 ? backendError.substring(0, 100) + '...' : backendError;
                throw new Error(message);
            }
            throw new Error(error.message || 'Request failed');
        }
    },
    login: async (data) => {
        try {
            const response = await api.post('/auth/login', data);
            return response.data;
        } catch (error) {
            const backendError = error.response?.data;
            if (backendError?.error) {
                throw new Error(backendError.error);
            }
            if (typeof backendError === 'string') {
                // Truncate if it's a long HTML string
                const message = backendError.length > 100 ? backendError.substring(0, 100) + '...' : backendError;
                throw new Error(message);
            }
            throw new Error(error.message || 'Request failed');
        }
    },
    forgotPassword: async (email) => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            const backendError = error.response?.data;
            if (backendError?.error) {
                throw new Error(backendError.error);
            }
            if (typeof backendError === 'string') {
                // Truncate if it's a long HTML string
                const message = backendError.length > 100 ? backendError.substring(0, 100) + '...' : backendError;
                throw new Error(message);
            }
            throw new Error(error.message || 'Request failed');
        }
    },
    verifyOtp: async (data) => {
        try {
            const response = await api.post('/auth/verify-otp', data);
            return response.data;
        } catch (error) {
            const backendError = error.response?.data;
            if (backendError?.error) {
                throw new Error(backendError.error);
            }
            if (typeof backendError === 'string') {
                // Truncate if it's a long HTML string
                const message = backendError.length > 100 ? backendError.substring(0, 100) + '...' : backendError;
                throw new Error(message);
            }
            throw new Error(error.message || 'Request failed');
        }
    },
    resetPassword: async (data) => {
        try {
            const response = await api.post('/auth/reset-password', data);
            return response.data;
        } catch (error) {
            const backendError = error.response?.data;
            if (backendError?.error) {
                throw new Error(backendError.error);
            }
            if (typeof backendError === 'string') {
                // Truncate if it's a long HTML string
                const message = backendError.length > 100 ? backendError.substring(0, 100) + '...' : backendError;
                throw new Error(message);
            }
            throw new Error(error.message || 'Request failed');
        }
    },
};
