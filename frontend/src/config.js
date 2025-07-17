const config = {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3546/api',
    baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:3546',
    environment: import.meta.env.VITE_NODE_ENV || 'development',
};

export default config;