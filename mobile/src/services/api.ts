import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'web' 
  ? 'http://localhost:8000/api/v1' 
  : 'http://10.0.2.2:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    let token = null;
    if (Platform.OS === 'web') {
      token = localStorage.getItem('userToken');
    } else {
      try {
        token = await SecureStore.getItemAsync('userToken');
      } catch (e) {}
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
