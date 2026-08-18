import api from './api';
import { BroadcastNotification, NotificationCreateReq } from '../types/notification.types';

export interface NotificationListResponse {
  notifications: BroadcastNotification[];
  unread_count: number;
}

export const notificationService = {
  async getNotifications(): Promise<NotificationListResponse> {
    const response = await api.get<NotificationListResponse>('/notifications');
    return response.data;
  },

  async getAdminNotifications(): Promise<BroadcastNotification[]> {
    const response = await api.get<BroadcastNotification[]>('/notifications/admin-list');
    return response.data;
  },

  async publishNotification(data: NotificationCreateReq): Promise<BroadcastNotification> {
    const response = await api.post<BroadcastNotification>('/notifications/broadcast', data);
    return response.data;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await api.post(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/read-all');
  }
};

export default notificationService;
