import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchCoachDashboardThunk, 
  fetchAssignedUsersThunk, 
  fetchUserProgressThunk, 
  sendCoachMessageThunk, 
  clearCoachError 
} from '../store/slices/coachSlice';

export const useCoach = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { assignedUsers, selectedUserProgress, dashboardStats, messages, isLoading, error } = useSelector((state: RootState) => state.coach);

  const getDashboard = useCallback(() => {
    return dispatch(fetchCoachDashboardThunk());
  }, [dispatch]);

  const getUsers = useCallback(() => {
    return dispatch(fetchAssignedUsersThunk());
  }, [dispatch]);

  const getUserProgress = useCallback((userId: string) => {
    return dispatch(fetchUserProgressThunk(userId));
  }, [dispatch]);

  const sendMessage = useCallback((userId: string, title: string, message: string) => {
    return dispatch(sendCoachMessageThunk({ userId, title, message }));
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearCoachError());
  }, [dispatch]);

  return {
    assignedUsers,
    selectedUserProgress,
    dashboardStats,
    messages,
    isLoading,
    error,
    getDashboard,
    getUsers,
    getUserProgress,
    sendMessage,
    clearError,
  };
};

export default useCoach;
