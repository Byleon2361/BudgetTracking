// services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5166/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/Auth/register', data),
  login: (data) => api.post('/Auth/login', data),
};

export const categoriesAPI = {
  getAll: () => api.get('/Categories'),
  getByType: (type) => api.get(`/Categories/type/${type}`),
  getById: (id) => api.get(`/Categories/${id}`),
  create: (data) => api.post('/Categories', data),
  update: (id, data) => api.put(`/Categories/${id}`, data),
  delete: (id) => api.delete(`/Categories/${id}`),
};

export const transactionsAPI = {
  getAll: (params) => api.get('/Transactions', { params }),
  getById: (id) => api.get(`/Transactions/${id}`),
  create: (data) => api.post('/Transactions', data),
  update: (id, data) => api.put(`/Transactions/${id}`, data),
  delete: (id) => api.delete(`/Transactions/${id}`),
  getBalance: () => api.get('/Transactions/balance'),
  getSummary: (startDate, endDate) => 
    api.get('/Transactions/summary', { params: { startDate, endDate } }),
};

export const budgetsAPI = {
  getAll: () => api.get('/Budgets'),
  getCurrent: () => api.get('/Budgets/current'),
  getById: (id) => api.get(`/Budgets/${id}`),
  create: (data) => api.post('/Budgets', data),
  update: (id, data) => api.put(`/Budgets/${id}`, data),
  delete: (id) => api.delete(`/Budgets/${id}`),
};

export default api;