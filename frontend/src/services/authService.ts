import api from './api';
import * as storage from '../utils/storage';
import { 
  LoginRequest, 
  RegisterRequest, 
  ForgotPasswordRequest, 
  SocialLoginRequest, 
  AuthResponse, 
  User 
} from '../types/auth.types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    // Save tokens securely
    await storage.setItem('icap_access_token', response.data.access_token);
    await storage.setItem('icap_refresh_token', response.data.refresh_token);
    
    return response.data;
  },

  async register(data: RegisterRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/register', data);
    return response.data;
  },

  async verifyEmail(token: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/verify-email', { token });
    
    // Store session tokens returned on successful verification
    await storage.setItem('icap_access_token', response.data.access_token);
    await storage.setItem('icap_refresh_token', response.data.refresh_token);
    
    return response.data;
  },

  async socialLogin(data: SocialLoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(`/auth/${data.provider}`, {
      id_token: data.identity_token,
      email: data.email,
      full_name: data.full_name,
    });
    
    // Save tokens securely
    await storage.setItem('icap_access_token', response.data.access_token);
    await storage.setItem('icap_refresh_token', response.data.refresh_token);
    
    return response.data;
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Backend logout failed, continuing with local cleanup', e);
    } finally {
      // Clear local storage tokens
      await storage.removeItem('icap_access_token');
      await storage.removeItem('icap_refresh_token');
    }
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async hasSavedSession(): Promise<boolean> {
    const token = await storage.getItem('icap_access_token');
    return !!token;
  }
};
export default authService;
