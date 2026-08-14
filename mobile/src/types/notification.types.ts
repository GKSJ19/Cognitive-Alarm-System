export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_by_id: string;
  created_by_name: string;
  created_at: string;
  is_read: boolean;
}

export interface NotificationState {
  notifications: BroadcastNotification[];
  adminNotifications: BroadcastNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationCreateReq {
  title: string;
  message: string;
  priority?: string;
}
