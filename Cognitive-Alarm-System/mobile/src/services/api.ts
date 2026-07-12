import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { API_BASE_URL } from '../constants/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (payload: { email: string; password: string }) => api.post('/auth/login', payload),
  register: (payload: { name: string; email: string; password: string }) => api.post('/auth/register', payload),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (payload: { token: string; password: string }) => api.post('/auth/reset-password', payload),
};

export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (payload: Record<string, unknown>) => api.put('/users/me', payload),
};

export const alarmsApi = {
  list: () => api.get('/alarms/'),
  create: (payload: Record<string, unknown>) => api.post('/alarms/', payload),
  update: (id: string, payload: Record<string, unknown>) => api.put(`/alarms/${id}`, payload),
  remove: (id: string) => api.delete(`/alarms/${id}`),
};

export const analyticsApi = {
  getSummary: () => api.get('/users/me'),
};

export const notificationsApi = {
  list: () => api.get('/notifications/'),
};

export default api;
