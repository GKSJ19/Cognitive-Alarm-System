import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchHabitsThunk, 
  createHabitThunk, 
  updateHabitThunk, 
  deleteHabitThunk, 
  fetchProgressThunk, 
  completeHabitThunk, 
  clearHabitError 
} from '../store/slices/habitSlice';
import { Habit } from '../types/habit.types';

export const useHabits = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { habits, progress, isLoading, error } = useSelector((state: RootState) => state.habits);

  const getHabits = useCallback(() => {
    return dispatch(fetchHabitsThunk());
  }, [dispatch]);

  const createHabit = useCallback((data: Partial<Habit>) => {
    return dispatch(createHabitThunk(data));
  }, [dispatch]);

  const updateHabit = useCallback((habitId: string, data: Partial<Habit>) => {
    return dispatch(updateHabitThunk({ habitId, data }));
  }, [dispatch]);

  const deleteHabit = useCallback((habitId: string) => {
    return dispatch(deleteHabitThunk(habitId));
  }, [dispatch]);

  const getProgress = useCallback(() => {
    return dispatch(fetchProgressThunk());
  }, [dispatch]);

  const completeHabit = useCallback((habitId: string, date: string, status?: string) => {
    return dispatch(completeHabitThunk({ habitId, date, status }));
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearHabitError());
  }, [dispatch]);

  return {
    habits,
    progress,
    isLoading,
    error,
    getHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    getProgress,
    completeHabit,
    clearError,
  };
};

export default useHabits;
