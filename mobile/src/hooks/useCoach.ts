import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchCoachDashboardSummaryThunk,
  fetchMyUsersThunk,
  fetchAssignedUserAnalyticsThunk,
  fetchNotificationsThunk,
  sendCoachMessageThunk, 
  clearCoachError 
} from '../store/slices/coachSlice';

export const useCoach = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    assignedUsers, 
    assignedUserCards, 
    selectedUserAnalytics, 
    dashboardSummary, 
    notifications, 
    dashboardStats, 
    messages, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.coach);

  const getDashboardSummary = useCallback(() => {
    return dispatch(fetchCoachDashboardSummaryThunk());
  }, [dispatch]);

  const getMyUsers = useCallback((search?: string, status?: string) => {
    return dispatch(fetchMyUsersThunk({ search, status }));
  }, [dispatch]);

  const getAssignedUserAnalytics = useCallback((userId: string) => {
    return dispatch(fetchAssignedUserAnalyticsThunk(userId));
  }, [dispatch]);

  const getNotifications = useCallback(() => {
    return dispatch(fetchNotificationsThunk());
  }, [dispatch]);

  const sendMessage = useCallback((userId: string, title: string, message: string) => {
    return dispatch(sendCoachMessageThunk({ userId, title, message }));
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearCoachError());
  }, [dispatch]);

  return {
    assignedUsers: assignedUserCards.length > 0 ? assignedUserCards : assignedUsers,
    assignedUserCards,
    selectedUserAnalytics,
    dashboardSummary,
    notifications,
    dashboardStats,
    messages,
    isLoading,
    error,
    getDashboardSummary,
    getDashboard: getDashboardSummary,
    getMyUsers,
    getUsers: getMyUsers,
    getAssignedUserAnalytics,
    getUserProgress: getAssignedUserAnalytics,
    getNotifications,
    sendMessage,
    clearError,
  };
};

export default useCoach;
