import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchDashboardOverviewThunk,
  fetchDetailedUsersThunk,
  fetchUserAnalyticsThunk,
  fetchDetailedCoachesThunk,
  assignCoachThunk,
  reassignCoachThunk,
  removeCoachAssignmentThunk,
  createCoachThunk,
  deleteCoachThunk,
  createUserThunk, 
  updateUserThunk, 
  deleteUserThunk, 
  toggleUserStatusThunk, 
  fetchLogsThunk, 
  fetchSettingsThunk, 
  updateSettingsThunk, 
  clearAdminError 
} from '../store/slices/adminSlice';

export const useAdmin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    users, 
    detailedUsers, 
    coaches, 
    detailedCoaches, 
    selectedUserAnalytics, 
    dashboardOverview, 
    dashboardStats, 
    logs, 
    settings, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.admin);

  const getDashboardOverview = useCallback(() => {
    return dispatch(fetchDashboardOverviewThunk());
  }, [dispatch]);

  const getDetailedUsers = useCallback((search?: string, status?: string, coachStatus?: string) => {
    return dispatch(fetchDetailedUsersThunk({ search, status, coachStatus }));
  }, [dispatch]);

  const getUserAnalytics = useCallback((userId: string) => {
    return dispatch(fetchUserAnalyticsThunk(userId));
  }, [dispatch]);

  const getDetailedCoaches = useCallback(() => {
    return dispatch(fetchDetailedCoachesThunk());
  }, [dispatch]);

  const assignCoach = useCallback((coachId: string, userId: string) => {
    return dispatch(assignCoachThunk({ coachId, userId }));
  }, [dispatch]);

  const reassignCoach = useCallback((userId: string, newCoachId: string) => {
    return dispatch(reassignCoachThunk({ userId, newCoachId }));
  }, [dispatch]);

  const removeCoachAssignment = useCallback((userId: string) => {
    return dispatch(removeCoachAssignmentThunk(userId));
  }, [dispatch]);

  const createCoach = useCallback((data: any) => {
    return dispatch(createCoachThunk(data));
  }, [dispatch]);

  const deleteCoach = useCallback((coachId: string) => {
    return dispatch(deleteCoachThunk(coachId));
  }, [dispatch]);

  const createUser = useCallback((data: any) => {
    return dispatch(createUserThunk(data));
  }, [dispatch]);

  const updateUser = useCallback((userId: string, data: any) => {
    return dispatch(updateUserThunk({ userId, data }));
  }, [dispatch]);

  const deleteUser = useCallback((userId: string) => {
    return dispatch(deleteUserThunk(userId));
  }, [dispatch]);

  const toggleStatus = useCallback((userId: string, suspend: boolean) => {
    return dispatch(toggleUserStatusThunk({ userId, suspend }));
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearAdminError());
  }, [dispatch]);

  return {
    users,
    detailedUsers,
    coaches,
    detailedCoaches,
    selectedUserAnalytics,
    dashboardOverview,
    dashboardStats: dashboardOverview?.overview_cards ?? dashboardStats,
    logs,
    settings,
    isLoading,
    error,
    getDashboardOverview,
    getDashboard: getDashboardOverview,
    getDetailedUsers,
    getUsers: getDetailedUsers,
    getUserAnalytics,
    getDetailedCoaches,
    getCoaches: getDetailedCoaches,
    assignCoach,
    reassignCoach,
    removeCoachAssignment,
    createCoach,
    deleteCoach,
    createUser,
    updateUser,
    deleteUser,
    toggleStatus,
    clearError,
  };
};

export default useAdmin;
