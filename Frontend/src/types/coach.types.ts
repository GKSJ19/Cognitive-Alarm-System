import { User } from './auth.types';

export interface CoachDashboardStats {
  total_assigned_users: number;
  active_users: number;
  todays_wakeups: number;
  habit_completion_rate: number;
  alarm_success_rate: number;
  challenge_success_rate: number;
}

export interface CoachMessage {
  message_id: string;
  coach_id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface CoachState {
  assignedUsers: User[];
  selectedUserProgress: any | null;
  dashboardStats: CoachDashboardStats | null;
  messages: CoachMessage[];
  isLoading: boolean;
  error: string | null;
}
