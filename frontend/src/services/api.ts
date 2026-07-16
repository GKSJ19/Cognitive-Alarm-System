import axios from 'axios';
import * as storage from '../utils/storage';
import { ENV } from '../config/env';

// Create Axios Instance
const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getItem('icap_access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Failed to retrieve access token from SecureStore', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Token Refreshing on 401
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;

    // Check if error is 401 Unauthorized and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getItem('icap_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Request token refresh
        const response = await axios.post(`${ENV.API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;

        // Save new tokens
        await storage.setItem('icap_access_token', access_token);
        await storage.setItem('icap_refresh_token', newRefreshToken);

        // Process queue
        processQueue(null, access_token);
        isRefreshing = false;

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Refresh token failed: Clear tokens and force logout
        await storage.removeItem('icap_access_token');
        await storage.removeItem('icap_refresh_token');
        
        // We can dispatch logout or let the Redux listener capture token loss
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
