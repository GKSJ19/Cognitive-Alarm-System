import api from './api';
import { User } from '../types/auth.types';
import { 
  AdminDashboardOverview, 
  DetailedUserCard, 
  DetailedCoachCard, 
  UserAnalyticsData 
} from '../types/admin.types';

export const adminService = {
  async getDashboardOverview(): Promise<AdminDashboardOverview> {
    const response = await api.get<AdminDashboardOverview>('/admin/dashboard');
    return response.data;
  },

  async getDetailedUsers(search?: string, status?: string, coachStatus?: string): Promise<DetailedUserCard[]> {
    const params: any = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (coachStatus) params.coach_status = coachStatus;
    const response = await api.get<DetailedUserCard[]>('/admin/users-detailed', { params });
    return response.data;
  },

  async getUserAnalytics(userId: string): Promise<UserAnalyticsData> {
    const response = await api.get<UserAnalyticsData>(`/admin/user-analytics/${userId}`);
    return response.data;
  },

  async getDetailedCoaches(): Promise<DetailedCoachCard[]> {
    const response = await api.get<DetailedCoachCard[]>('/admin/coaches-detailed');
    return response.data;
  },

  async assignCoach(coachId: string, userId: string): Promise<any> {
    const response = await api.post<any>('/admin/assign-coach', {
      coach_id: coachId,
      user_id: userId,
    });
    return response.data;
  },

  async reassignCoach(userId: string, newCoachId: string): Promise<any> {
    const response = await api.post<any>('/admin/reassign-coach', {
      user_id: userId,
      new_coach_id: newCoachId,
    });
    return response.data;
  },

  async removeCoachAssignment(userId: string): Promise<void> {
    await api.delete(`/admin/remove-assignment/${userId}`);
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

  async deleteCoach(coachId: string): Promise<void> {
    await api.delete(`/admin/coaches/${coachId}`);
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
