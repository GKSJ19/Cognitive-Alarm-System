import { User } from './auth.types';
import { UserAnalyticsData } from './admin.types';

export interface CoachDashboardSummary {
  summary_cards: {
    assigned_users: number;
    active_users_today: number;
    average_habit_score: number;
    weekly_improvement: number;
    total_challenges_completed: number;
    average_completion_time: number;
  };
  notifications: CoachNotificationItem[];
}

export interface CoachNotificationItem {
  id: string;
  type: string;
  user_id: string;
  title: string;
  message: string;
  time: string;
  is_read: boolean;
}

export interface AssignedUserCard {
  id: string;
  full_name: string;
  email: string;
  current_habit_score: number;
  current_streak: number;
  total_challenges: number;
  average_completion_time: number;
  last_active: string;
  account_status: string;
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

export interface CoachDashboardStats {
  total_assigned_users: number;
  active_users: number;
  todays_wakeups: number;
  habit_completion_rate: number;
  alarm_success_rate: number;
  challenge_success_rate: number;
}

export interface CoachState {
  assignedUsers: User[];
  assignedUserCards: AssignedUserCard[];
  selectedUserAnalytics: UserAnalyticsData | null;
  dashboardSummary: CoachDashboardSummary | null;
  notifications: CoachNotificationItem[];
  dashboardStats: CoachDashboardStats | null;
  messages: CoachMessage[];
  isLoading: boolean;
  error: string | null;
}
