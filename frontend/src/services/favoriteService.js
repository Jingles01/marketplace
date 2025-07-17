import axios from 'axios';
import config from '../config';

const API_URL = `${config.apiUrl}/favorites`;

const getAuthConfig = () => {
    const token = localStorage.getItem('access_token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const favoriteService = {
    getFavoriteIds: async () => {
        const response = await axios.get(`${API_URL}/ids`, getAuthConfig());
        return response.data;
    },
    getFavorites: async () => {
        const response = await axios.get(API_URL, getAuthConfig());
        return response.data;
    },
    addFavorite: async (listingId) => {
        const response = await axios.post(API_URL, { listingId }, getAuthConfig());
        return response.data;
    },
    removeFavorite: async (listingId) => {
        const urlToDelete = `${API_URL}/${listingId}`;
        const response = await axios.delete(urlToDelete, getAuthConfig());
        return response.data;
    }
};

export default favoriteService;