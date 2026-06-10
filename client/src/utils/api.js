import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// This interceptor automatically attaches the CORRECT token to EVERY request
API.interceptors.request.use(
  (config) => {
    // 1. Detect where the user is currently browsing
    const isAdminPanel = window.location.pathname.startsWith('/admin');
    
    // 2. Grab the appropriate token
    // (Assuming your AuthContext saves the customer token as 'token')
    const token = isAdminPanel 
        ? localStorage.getItem('adminToken') 
        : localStorage.getItem('token');

    // 3. Attach it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;