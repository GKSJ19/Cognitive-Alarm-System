import api from './api';
import { User } from '../types/auth.types';
import { AdminDashboardStats } from '../types/admin.types';

export const adminService = {
  async getDashboard(): Promise<AdminDashboardStats> {
    const response = await api.get<AdminDashboardStats>('/admin/dashboard');
    return response.data;
  },

  async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/admin/users');
    return response.data;
  },

  async createUser(data: any): Promise<User> {
    const response = await api.post<User>('/admin/users', data);
    return response.data;
  },

  async updateUser(userId: string, data: any): Promise<User> {
    const response = await api.put<User>(`/admin/users/${userId}`, data);
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  },

  async activateUser(userId: string): Promise<User> {
    const response = await api.put<User>(`/admin/users/${userId}/activate`);
    return response.data;
  },

  async suspendUser(userId: string): Promise<User> {
    const response = await api.put<User>(`/admin/users/${userId}/suspend`);
    return response.data;
  },

  async getCoaches(): Promise<User[]> {
    const response = await api.get<User[]>('/admin/coaches');
    return response.data;
  },

  async createCoach(data: any): Promise<User> {
    const response = await api.post<User>('/admin/coaches', data);
    return response.data;
  },

  async assignCoach(coachId: string, userId: string): Promise<any> {
    const response = await api.post<any>('/admin/assign-coach', {
      coach_id: coachId,
      user_id: userId,
    });
    return response.data;
  },

  async getLogs(): Promise<any[]> {
    const response = await api.get<any[]>('/admin/logs');
    return response.data;
  },

  async getSettings(): Promise<any> {
    const response = await api.get<any>('/admin/settings');
    return response.data;
  },

  async updateSettings(settings: any): Promise<any> {
    const response = await api.put<any>('/admin/settings', settings);
    return response.data;
  }
};

export default adminService;
