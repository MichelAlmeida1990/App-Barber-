import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação se disponível
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API de Autenticação
export const authAPI = {
  test: () => api.get('/auth/test'),
};

// API de Clientes
export const clientsAPI = {
  test: () => api.get('/clients/test'),
  getAll: () => api.get('/clients'),
  getById: (id: string) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: string, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

// API de Barbeiros
export const barbersAPI = {
  test: () => api.get('/barbers/test'),
  getAll: () => api.get('/barbers'),
  getById: (id: string) => api.get(`/barbers/${id}`),
  create: (data: any) => api.post('/barbers', data),
  update: (id: string, data: any) => api.put(`/barbers/${id}`, data),
  delete: (id: string) => api.delete(`/barbers/${id}`),
};

// API de Agendamentos
export const appointmentsAPI = {
  test: () => api.get('/appointments/test'),
  getAll: () => api.get('/appointments'),
  getById: (id: string) => api.get(`/appointments/${id}`),
  create: (data: any) => api.post('/appointments', data),
  update: (id: string, data: any) => api.put(`/appointments/${id}`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

// API de Serviços
export const servicesAPI = {
  test: () => api.get('/services/test'),
  getAll: () => api.get('/services'),
  getById: (id: string) => api.get(`/services/${id}`),
  create: (data: any) => api.post('/services', data),
  update: (id: string, data: any) => api.put(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
};

// API de Produtos
export const productsAPI = {
  test: () => api.get('/products/test'),
  getAll: () => api.get('/products'),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// API de Vendas
export const salesAPI = {
  test: () => api.get('/sales/test'),
  getAll: () => api.get('/sales'),
  getById: (id: string) => api.get(`/sales/${id}`),
  create: (data: any) => api.post('/sales', data),
  update: (id: string, data: any) => api.put(`/sales/${id}`, data),
  delete: (id: string) => api.delete(`/sales/${id}`),
};

// API de Analytics
export const analyticsAPI = {
  test: () => api.get('/analytics/test'),
  getDashboard: () => api.get('/analytics/dashboard'),
  getRevenue: (period: string) => api.get(`/analytics/revenue?period=${period}`),
  getClients: (period: string) => api.get(`/analytics/clients?period=${period}`),
};

// API de IA
export const aiAPI = {
  test: () => api.get('/ai/test'),
  recommend: (data: any) => api.post('/ai/recommend', data),
  analyze: (data: any) => api.post('/ai/analyze', data),
};

export default api; 