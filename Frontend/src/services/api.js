import axios from 'axios';

// ✅ BACKEND PORT 8000 (Django default)
const BACKEND_PORT = 8000;
const FRONTEND_PORT = 3000;

// ✅ YOUR LAPTOP IP (Change this to your laptop's IP address)
const LAPTOP_IP = '10.125.185.205';  // ← Apna IP daalo

// ✅ Auto-detect base URL
const getBaseURL = () => {
    const hostname = window.location.hostname;
    
    console.log('Current hostname:', hostname);
    console.log('Window location:', window.location);
    
    // Localhost (laptop pe development)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `http://127.0.0.1:${BACKEND_PORT}/api/`;
    }
    
    // Mobile or other devices on same network
    return `http://${LAPTOP_IP}:${BACKEND_PORT}/api/`;
};

const API = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// ✅ Add token to every request
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`📍 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

// ✅ Response interceptor
API.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ Response error:', error.response?.status, error.response?.data);
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            console.log('🔒 Token expired or invalid, logging out...');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('medicareUser');
            localStorage.removeItem('user_type');
            localStorage.removeItem('user_role');
            localStorage.removeItem('currentPage');
            
            // Redirect to home if not already there
            if (window.location.pathname !== '/' && window.location.pathname !== '/home') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

// ✅ Test function to check if backend is reachable
export const testBackendConnection = async () => {
    try {
        const response = await API.get('doctors/');
        console.log('✅ Backend connection successful! Doctors count:', response.data?.length);
        return true;
    } catch (error) {
        console.error('❌ Backend connection failed:', error.message);
        return false;
    }
};

export default API;