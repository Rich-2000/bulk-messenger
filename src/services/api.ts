import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://bulk-messenger-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string; phoneNumber?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getMe: () => api.get('/auth/me'),
  
  updateProfile: (data: { name?: string; phoneNumber?: string }) =>
    api.put('/auth/profile', data),
};

// Messages API
export const messagesAPI = {
  sendMessage: (data: any) => api.post('/messages/send', data),
  
  getMessages: (params?: { page?: number; limit?: number; type?: string; status?: string }) =>
    api.get('/messages', { params }).then(res => res.data),
  
  getMessageStats: () => 
    api.get('/messages/stats').then(res => res.data),
};

// Contacts API
export const contactsAPI = {
  createContact: (data: any) => api.post('/contacts', data),
  
  importContacts: (data: any[]) => api.post('/contacts/import', data),
  
  getContacts: (params?: { page?: number; limit?: number; group?: string; search?: string }) =>
    api.get('/contacts', { params }),
  
  updateContact: (id: string, data: any) => api.put(`/contacts/${id}`, data),
  
  deleteContact: (id: string) => api.delete(`/contacts/${id}`),
};

export default api;