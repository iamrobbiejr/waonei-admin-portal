import axios from 'axios';

// Since we're likely running locally or against a specific backend URL
// For now, let's assume the backend is on localhost:8000 based on the provided python code.
// Ideally this should be an env var.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('waonei_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401s
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear local storage and redirect to login if 401 occurs
            // We'll handle the redirect in the React component/Context usually, 
            // but clearing the token here is safe.
            localStorage.removeItem('waonei_token');
            localStorage.removeItem('waonei_user');
            // Optional: Force reload or event dispatch
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
