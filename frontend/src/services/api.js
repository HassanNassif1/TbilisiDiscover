import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000,
  withCredentials: true
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// ✅ Export api as default
export default api;

// ✅ Export businessApi as named export
export const businessApi = {
  // Get all businesses with filters
  getBusinesses: (params = {}) => {
    return api.get('/businesses', { params });
  },
  
  // Get business by slug
  getBusinessBySlug: (slug) => {
    return api.get(`/businesses/${slug}`);
  },
  
  // Get featured businesses
  getFeatured: () => {
    return api.get('/businesses', { params: { featured: 'true', limit: 6 } });
  },
  
  // Get popular businesses
  getPopular: () => {
    return api.get('/businesses', { params: { sort: 'popular', limit: 6 } });
  },
  
  // Get businesses by category
  getByCategory: (categoryId) => {
    return api.get('/businesses', { params: { category: categoryId } });
  }
};
// src/services/api.js

// Add this export
export const categoryApi = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response;
  },
  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response;
  },
  create: async (data) => {
    const response = await api.post('/categories', data);
    return response;
  },
  update: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response;
  },
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response;
  },
};