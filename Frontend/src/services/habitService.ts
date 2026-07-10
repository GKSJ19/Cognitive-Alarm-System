import api from './api';
import { Habit, HabitProgress } from '../types/habit.types';

export const habitService = {
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
