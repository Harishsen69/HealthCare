import axios from 'axios';

// ✅ Auto-detect base URL (works on both laptop and mobile)
const getBaseURL = () => {
    // Get current hostname from browser
    const hostname = window.location.hostname;
    
    // If running on localhost (laptop)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://127.0.0.1:8000/api/';
    }
    
    // If running on mobile or other devices (using laptop's IP)
    // 🔁 CHANGE THIS TO YOUR LAPTOP'S IP
    return 'http://10.179.231.205:8000/api/';
};

const API = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;