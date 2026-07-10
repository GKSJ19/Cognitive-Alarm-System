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

export interface HabitState {
  habits: Habit[];
  progress: HabitProgress[];
  isLoading: boolean;
  error: string | null;
}
