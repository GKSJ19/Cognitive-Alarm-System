export interface ChallengeResult {
  id: string;
  user_id: string;
  challenge_id?: string | null;
  challenge_type: string;
  difficulty: string;
  time_taken_seconds: number;
  is_correct: boolean;
  attempts: number;
  habit_score: number;
  completed_at: string;
}

export interface DailyScoreTrend {
  date: string;
  average_score: number;
  count: number;
}

export interface DifficultyPerformance {
  difficulty: string;
  total: number;
  correct: number;
  success_rate: number;
  avg_score: number;
  avg_time_seconds: number;
}

export interface HabitDashboardData {
  current_habit_score: number;
  average_completion_time: number;
  total_challenges_completed: number;
  success_rate: number;
  fastest_completion_time: number;
  weekly_avg_score: number;
  monthly_avg_score: number;
  score_trend_7_days: DailyScoreTrend[];
  weekly_progress: DailyScoreTrend[];
  monthly_progress: DailyScoreTrend[];
  difficulty_performance: DifficultyPerformance[];
  recent_history: ChallengeResult[];
}

export interface RecordChallengeRequest {
  challenge_id?: string;
  challenge_type?: string;
  difficulty?: string;
  time_taken_seconds: number;
  is_correct?: boolean;
  attempts?: number;
}

export interface HabitState {
  dashboardData: HabitDashboardData | null;
  history: ChallengeResult[];
  latestScore: number;
  isLoading: boolean;
  error: string | null;
}

// Legacy types preserved for backward compatibility
export interface Habit {
  habit_id: string;
  user_id: string;
  title: string;
  description: string | null;
  frequency: string;
  reminder_time: string | null;
  target_days: number;
  is_active: boolean;
  created_at: string;
}

export interface HabitProgress {
  progress_id: string;
  habit_id: string;
  completion_date: string;
  status: string;
  streak_count: number;
}
