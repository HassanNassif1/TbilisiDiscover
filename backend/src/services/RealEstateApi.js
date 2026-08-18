// src/services/realEstateApi.js
import api from './api';

// Property Endpoints
export const propertyApi = {
  // Get all properties
  getAll: (params) => api.get('/real-estate/properties', { params }),
  
  // Get single property
  getById: (id) => api.get(`/real-estate/properties/${id}`),
  
  // Create property
  create: (data) => api.post('/real-estate/properties', data),
  
  // Update property
  update: (id, data) => api.put(`/real-estate/properties/${id}`, data),
  
  // Delete property
  delete: (id) => api.delete(`/real-estate/properties/${id}`),
  
  // Get property images
  getImages: (id) => api.get(`/real-estate/properties/${id}/images`),
};

// Request Endpoints
export const requestApi = {
  // Get all requests
  getAll: (params) => api.get('/real-estate/requests', { params }),
  
  // Create request
  create: (data) => api.post('/real-estate/requests', data),
  
  // Update request status
  updateStatus: (id, status) => api.put(`/real-estate/requests/${id}/status`, { status }),
};

// Agent Endpoints
export const agentApi = {
  // Get all agents
  getAll: () => api.get('/real-estate/agents'),
  
  // Get agent by id
  getById: (id) => api.get(`/real-estate/agents/${id}`),
};

// Saved Properties Endpoints
export const savedApi = {
  // Get user's saved properties
  getMy: () => api.get('/real-estate/saved'),
  
  // Save property
  save: (propertyId) => api.post(`/real-estate/saved/${propertyId}`),
  
  // Unsave property
  unsave: (propertyId) => api.delete(`/real-estate/saved/${propertyId}`),
};

export default {
  propertyApi,
  requestApi,
  agentApi,
  savedApi,
};