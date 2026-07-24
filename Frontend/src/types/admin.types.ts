import { User } from './auth.types';

export interface DetailedUserCard {
  id: string;
  full_name: str;
  email: str;
  phone_number?: string | null;
  role: string;
  registration_date: string;
  last_login: string;
  account_status: string;
  assigned_coach?: { id: string; full_name: string; email: string } | null;
  current_habit_score: number;
  total_challenges_completed: number;
  average_completion_time: number;
  success_rate: number;
  current_streak: number;
  longest_streak: number;
  preferred_wakeup_time?: string | null;
  total_alarms_created: number;
  last_challenge_date?: string | null;
}

export interface DetailedCoachCard {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string | null;
  role: string;
  assigned_users_count: number;
  total_active_users: number;
  average_user_habit_score: number;
  average_challenge_completion_rate: number;
  created_at: string;
}

export interface UserAnalyticsData {
  user_info: {
    id: string;
    full_name: string;
    email: string;
    phone_number?: string | null;
    gender?: string | null;
    preferred_wakeup_time?: string | null;
    assigned_coach?: { id: string; full_name: string; email: string } | null;
    registration_date: string;
    account_status: string;
  };
  challenge_analytics: {
    total_completed: number;
    total_failed: number;
    average_completion_time: number;
    fastest_completion: number;
    slowest_completion: number;
    success_percentage: number;
    difficulty_performance: Record<string, { total: number; correct: number; success_rate: number; avg_score: number }>;
  };
  habit_score_analytics: {
    current_score: number;
    weekly_score: number;
    monthly_score: number;
    highest_score: number;
    lowest_score: number;
    average_score: number;
    score_history: any[];
  };
  alarm_analytics: {
    total_alarms: number;
    completed_alarms: number;
    missed_alarms: number;
    snoozed_alarms: number;
    wakeup_consistency: number;
  };
  charts: {
    habit_score_trend: any[];
    weekly_progress: any[];
    monthly_progress: any[];
    completion_time_trend: any[];
    success_rate_trend: any[];
    difficulty_distribution: any[];
  };
}

export interface AdminDashboardOverview {
  overview_cards: {
    total_users: number;
    total_coaches: number;
    active_users_today: number;
    challenges_completed_today: number;
    average_habit_score: number;
    total_challenges_completed: number;
    active_alarms: number;
    new_registrations_today: number;
  };
  charts: {
    user_growth: any[];
    daily_challenges: any[];
    habit_score_trend: any[];
    challenge_difficulty_distribution: any[];
    weekly_active_users: any[];
  };
  recent_activities: any[];
}

export interface AdminState {
  users: User[];
  detailedUsers: DetailedUserCard[];
  coaches: User[];
  detailedCoaches: DetailedCoachCard[];
  selectedUserAnalytics: UserAnalyticsData | null;
  dashboardOverview: AdminDashboardOverview | null;
  dashboardStats: any | null;
  logs: any[];
  settings: any | null;
  isLoading: boolean;
  error: string | null;
}
