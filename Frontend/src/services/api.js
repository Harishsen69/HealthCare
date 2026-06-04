import axios from 'axios';

// ✅ YOUR LAPTOP IP (from ipconfig)
const LAPTOP_IP = '10.65.173.205';

// ✅ Auto-detect base URL (works on both laptop and mobile)
const getBaseURL = () => {
    // Get current hostname from browser
    const hostname = window.location.hostname;
    
    console.log('Current hostname:', hostname);
    
    // If running on localhost (laptop testing)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://127.0.0.1:8000/api/';
    }
    
    // If running on mobile or other devices (using laptop's IP)
    // This will work when accessed via http://10.179.231.205:3000
    return `http://${LAPTOP_IP}:8000/api/`;
};

// ✅ Alternative: Force IP mode (uncomment if auto-detect not working)
// const getBaseURL = () => {
//     return `http://${LAPTOP_IP}:8000/api/`;
// };

const API = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
});

// Add token to every request
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
API.interceptors.response.use(
    (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('Response error:', error.response?.status, error.response?.data);
        
        if (error.response?.status === 401) {
            // Token expired or invalid
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

export default API;