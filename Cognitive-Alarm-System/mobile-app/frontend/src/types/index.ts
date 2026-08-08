/** User role from RBAC system */
export interface Role {
  id: string;
  name: string;
  description: string | null;
}

/** User profile with personal preferences */
export interface UserProfile {
  id: string;
  user_id: string;
  avatar_url: string | null;
  bio: string | null;
  phone_number: string | null;
  timezone: string | null;
  theme_preference: string | null;
}

/** Authenticated user */
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
  role: Role | null;
  profile: UserProfile | null;
}

/** JWT token response */
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

/** Dashboard stat card */
export interface DashboardStats {
  habit_score: number;
  habit_score_change: number;
  avg_wake_time: string;
  puzzle_accuracy: number;
  puzzle_accuracy_change: number;
  weekly_scores: WeeklyScore[];
  upcoming_alarms: Alarm[];
  recent_activity: ActivityItem[];
}

export interface WeeklyScore {
  name: string;
  score: number;
}

export interface Alarm {
  time: string;
  days: string;
  type: string;
  active: boolean;
}

export interface ActivityItem {
  action: string;
  time: string;
  type: string;
}

/** Standard API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/** Standard API error response */
export interface ApiError {
  success: boolean;
  error: {
    code: string;
    message: string;
  };
}
