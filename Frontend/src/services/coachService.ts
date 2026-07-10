import api from './api';
import { User } from '../types/auth.types';
import { CoachDashboardStats, CoachMessage } from '../types/coach.types';

export const coachService = {
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
