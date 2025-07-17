import axios from 'axios';
import config from "../config.js";

const API_URL = `${config.apiUrl}/auth`;
const USERS_URL = `${config.apiUrl}/users`;

const authService = {
    login: async (email, password) => {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        if (response.data.token) {
            localStorage.setItem('access_token', response.data.token);
        }
        return response.data;
    },

    signup: async (username, email, password) => {
        const response = await axios.post(`${API_URL}/register`, { username, email, password });
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('access_token');
    },

    getCurrentUser: () => {
        return localStorage.getItem('access_token');
    },

    setupInterceptors: () => {
        axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('access_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
    },

    getUserId: () => {
        const token = localStorage.getItem('access_token');
        if (!token) return null;

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            return payload.userId;
        } catch (error) {
            return null;
        }
    },

    setProfile: async () => {
        const response = await axios.get(`${USERS_URL}/profile`);
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await axios.put(`${USERS_URL}/profile`, profileData);
        return response.data;
    },

    getUserReviews: async (userId) => {
        const response = await axios.get(`${USERS_URL}/reviews/${userId}`);
        return response.data;
    }
};

export default authService;