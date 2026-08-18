import api from './api';
import { User } from '../types/auth.types';
import { 
  CoachDashboardSummary, 
  AssignedUserCard, 
  CoachNotificationItem, 
  CoachMessage, 
  CoachDashboardStats 
} from '../types/coach.types';
import { UserAnalyticsData } from '../types/admin.types';

export const coachService = {
  async getDashboardSummary(): Promise<CoachDashboardSummary> {
    const response = await api.get<CoachDashboardSummary>('/coach/dashboard');
    return response.data;
  },

  async getMyUsers(search?: string, status?: string): Promise<AssignedUserCard[]> {
    const params: any = {};
    if (search) params.search = search;
    if (status) params.status = status;
    const response = await api.get<AssignedUserCard[]>('/coach/my-users', { params });
    return response.data;
  },

  async getAssignedUserAnalytics(userId: string): Promise<UserAnalyticsData> {
    const response = await api.get<UserAnalyticsData>(`/coach/user-analytics/${userId}`);
    return response.data;
  },

  async getNotifications(): Promise<CoachNotificationItem[]> {
    const response = await api.get<CoachNotificationItem[]>('/coach/notifications');
    return response.data;
  },

  async getDashboard(): Promise<CoachDashboardStats> {
    const response = await api.get<CoachDashboardStats>('/coach/dashboard');
    return response.data;
  },

  async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/coach/users');
    return response.data;
  },

  async getUserProgress(userId: string): Promise<any> {
    const response = await api.get<any>(`/coach/user-progress/${userId}`);
    return response.data;
  },

  async sendMessage(userId: string, title: string, message: string): Promise<CoachMessage> {
    const response = await api.post<CoachMessage>('/coach/message', {
      user_id: userId,
      title,
      message,
    });
    return response.data;
  },

  async deleteMessage(messageId: string): Promise<void> {
    await api.delete(`/coach/message/${messageId}`);
  },

  async assignUser(coachId: string, userId: string): Promise<any> {
    const response = await api.post<any>('/coach/assign-user', {
      coach_id: coachId,
      user_id: userId,
    });
    return response.data;
  },

  async removeUser(userId: string): Promise<void> {
    await api.delete(`/coach/remove-user/${userId}`);
  }
};

export default coachService;
