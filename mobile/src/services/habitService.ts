import api from './api';
import { 
  ChallengeResult, 
  HabitDashboardData, 
  RecordChallengeRequest,
  Habit,
  HabitProgress
} from '../types/habit.types';

export const habitService = {
  // --- Habit Score System Services ---
  async recordChallengeResult(data: RecordChallengeRequest): Promise<ChallengeResult> {
    const response = await api.post<ChallengeResult>('/habits/score', data);
    return response.data;
  },

  async getHabitDashboard(): Promise<HabitDashboardData> {
    const response = await api.get<HabitDashboardData>('/habits/analytics');
    return response.data;
  },

  async getChallengeHistory(limit: number = 50): Promise<ChallengeResult[]> {
    const response = await api.get<ChallengeResult[]>('/habits/history', { params: { limit } });
    return response.data;
  },

  async getLatestScore(): Promise<{ user_id: string; latest_habit_score: number }> {
    const response = await api.get<{ user_id: string; latest_habit_score: number }>('/habits/score/latest');
    return response.data;
  },

  // --- Legacy Habit Stubs (for backwards compatibility) ---
  async getHabits(): Promise<Habit[]> {
    const response = await api.get<Habit[]>('/habits');
    return response.data;
  },

  async createHabit(data: Partial<Habit>): Promise<Habit> {
    const response = await api.post<Habit>('/habits', data);
    return response.data;
  },

  async updateHabit(habitId: string, data: Partial<Habit>): Promise<Habit> {
    const response = await api.put<Habit>(`/habits/${habitId}`, data);
    return response.data;
  },

  async deleteHabit(habitId: string): Promise<void> {
    await api.delete(`/habits/${habitId}`);
  },

  async getProgress(): Promise<HabitProgress[]> {
    const response = await api.get<HabitProgress[]>('/habits/progress');
    return response.data;
  },

  async completeHabit(habitId: string, date: string, status: string = 'completed'): Promise<HabitProgress> {
    const response = await api.post<HabitProgress>('/habits/complete', {
      habit_id: habitId,
      completion_date: date,
      status,
    });
    return response.data;
  }
};

export default habitService;
