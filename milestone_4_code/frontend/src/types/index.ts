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
  id: string;
  user_id: string;
  time: string;
  days: string;
  type?: string;
  challenge_type: string;
  difficulty: string;
  active: boolean;
}

export interface ActivityItem {
  action: string;
  time: string;
  type: string;
}

export interface ChallengeSession {
  id: string;
  user_id: string;
  challenge_type: string;
  sub_type: string | null;
  difficulty: string;
  score: number;
  xp_earned: number;
  time_taken_seconds: number;
  is_successful: boolean;
  completed_at: string;
}

export interface HabitStreak {
  id: string;
  user_id: string;
  current_streak: number;
  max_streak: number;
  total_xp: number;
  last_completed_at: string | null;
}

export interface Reward {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon_name: string | null;
  earned_at: string;
}

export interface CategoryStat {
  category: string;
  total_attempts: number;
  successful: number;
  accuracy: number;
}

export interface HabitAnalytics {
  habit_score: number;
  total_xp: number;
  avg_accuracy: number;
  total_challenges_completed: number;
  success_rate: number;
  streak: HabitStreak;
  recent_rewards: Reward[];
  category_breakdown: CategoryStat[];
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

// ═══════════════════════════════════════════════════════════════════════════
// Milestone 3 — Analytics Types
// ═══════════════════════════════════════════════════════════════════════════

/** Behavioral analytics data for a single day */
export interface BehaviorAnalyticsData {
  id: string;
  user_id: string;
  analytics_date: string;
  wake_up_consistency: number;
  avg_wake_up_delay_minutes: number;
  avg_snooze_count: number;
  sleep_schedule_adherence: number;
  challenge_success_rate: number;
  daily_productivity_score: number;
  avg_sleep_duration_hours: number;
  total_snooze_count: number;
  total_challenges_attempted: number;
  total_challenges_successful: number;
  avg_challenge_completion_time: number;
  created_at: string;
}

/** Habit score with weighted breakdown */
export interface HabitScoreData {
  total_score: number;
  score_date?: string;
  wake_up_consistency_raw: number;
  challenge_success_raw: number;
  snooze_reduction_raw: number;
  sleep_adherence_raw: number;
  wake_up_consistency_weighted: number;
  challenge_success_weighted: number;
  snooze_reduction_weighted: number;
  sleep_adherence_weighted: number;
}

/** Light-weight habit score entry for trend charts */
export interface HabitScoreHistoryItem {
  score_date: string;
  total_score: number;
}

/** Personalised recommendation */
export interface RecommendationData {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: "sleep" | "challenge" | "snooze" | "consistency";
  priority: "low" | "medium" | "high" | "critical";
  rule_id: string;
  is_active: boolean;
  is_dismissed: boolean;
  created_at: string;
  expires_at: string | null;
}

/** Difficulty change log entry */
export interface DifficultyHistoryItem {
  id: string;
  user_id: string;
  previous_difficulty: string | null;
  new_difficulty: string;
  accuracy_at_change: number;
  avg_completion_time: number;
  snooze_count_at_change: number;
  reason: string | null;
  changed_at: string;
}

/** Current difficulty level */
export interface CurrentDifficulty {
  current_difficulty: string;
  accuracy: number;
  avg_completion_time: number;
  total_challenges_30d: number;
  last_changed_at: string | null;
}

/** Rolling 30-day aggregate statistics */
export interface UserStatisticsData {
  id: string;
  user_id: string;
  current_difficulty: string;
  total_alarms_set: number;
  total_alarms_dismissed: number;
  total_snoozes: number;
  total_challenges_attempted: number;
  total_challenges_passed: number;
  avg_wake_up_delay_minutes: number;
  avg_snooze_count: number;
  avg_challenge_time_seconds: number;
  avg_sleep_duration_hours: number;
  wake_up_consistency_pct: number;
  challenge_accuracy_pct: number;
  sleep_adherence_pct: number;
  current_wake_streak: number;
  best_wake_streak: number;
  latest_habit_score: number;
  computed_at: string;
}

/** Chart data point */
export interface ChartDataPoint {
  label: string;
  value: number;
}

/** Dashboard data (daily/weekly/monthly) */
export interface DashboardData {
  habit_score: number;
  habit_score_breakdown: {
    wake_up_consistency: number;
    challenge_success: number;
    snooze_reduction: number;
    sleep_adherence: number;
  };
  difficulty_level: string;
  recommendations: RecommendationData[];
  wake_up_streak: number;
  challenge_accuracy: number;
  sleep_duration: number;
  wake_up_delay: number;
  snooze_statistics: {
    avg_snooze: number;
    total_snooze: number;
    snooze_trend: string;
  };
  charts: {
    habit_score_trend: ChartDataPoint[];
    consistency_trend: ChartDataPoint[];
  };
  // Daily-specific
  date?: string;
  productivity_score?: number;
  challenges_today?: number;
  // Weekly-specific
  week_start?: string;
  week_end?: string;
  // Monthly-specific
  month?: string;
  calendar_heatmap?: Array<{ date: string; score: number; status: string }>;
}
