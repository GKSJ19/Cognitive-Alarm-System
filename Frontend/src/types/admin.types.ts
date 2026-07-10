import { User } from './auth.types';

export interface AdminDashboardStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  total_coaches: number;
  total_alarms: number;
  total_habits: number;
  total_challenges: number;
  todays_wakeups: number;
  todays_missed_alarms: number;
  system_health: string;
}

export interface AdminState {
  users: User[];
  coaches: User[];
  dashboardStats: AdminDashboardStats | null;
  logs: any[];
  settings: any | null;
  isLoading: boolean;
  error: string | null;
}
