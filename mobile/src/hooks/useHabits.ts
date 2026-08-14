import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchHabitDashboardThunk, 
  recordChallengeResultThunk, 
  fetchChallengeHistoryThunk, 
  fetchLatestScoreThunk, 
  clearHabitError 
} from '../store/slices/habitSlice';
import { RecordChallengeRequest } from '../types/habit.types';

export const useHabits = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboardData, history, latestScore, isLoading, error } = useSelector((state: RootState) => state.habits);

  const getHabitDashboard = useCallback(() => {
    return dispatch(fetchHabitDashboardThunk());
  }, [dispatch]);

  const recordChallengeResult = useCallback((data: RecordChallengeRequest) => {
    return dispatch(recordChallengeResultThunk(data));
  }, [dispatch]);

  const getChallengeHistory = useCallback((limit?: number) => {
    return dispatch(fetchChallengeHistoryThunk(limit));
  }, [dispatch]);

  const getLatestScore = useCallback(() => {
    return dispatch(fetchLatestScoreThunk());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearHabitError());
  }, [dispatch]);

  return {
    dashboardData,
    history,
    latestScore,
    currentScore: dashboardData?.current_habit_score ?? latestScore ?? 0,
    isLoading,
    error,
    getHabitDashboard,
    recordChallengeResult,
    getChallengeHistory,
    getLatestScore,
    clearError,
    // Backwards compatibility helpers
    getHabits: getHabitDashboard,
    getProgress: getHabitDashboard,
    createHabit: () => {},
    updateHabit: () => {},
    deleteHabit: () => {},
    completeHabit: () => {},
    habits: [],
    progress: [],
  };
};

export default useHabits;
