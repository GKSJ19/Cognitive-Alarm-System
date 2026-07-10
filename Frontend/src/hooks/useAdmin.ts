import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchAdminDashboardThunk, 
  fetchUsersThunk, 
  createUserThunk, 
  updateUserThunk, 
  deleteUserThunk, 
  toggleUserStatusThunk, 
  fetchCoachesThunk, 
  fetchLogsThunk, 
  fetchSettingsThunk, 
  updateSettingsThunk, 
  clearAdminError 
} from '../store/slices/adminSlice';

export const useAdmin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, coaches, dashboardStats, logs, settings, isLoading, error } = useSelector((state: RootState) => state.admin);

  const getDashboard = useCallback(() => {
    return dispatch(fetchAdminDashboardThunk());
  }, [dispatch]);

  const getUsers = useCallback(() => {
    return dispatch(fetchUsersThunk());
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

  const getCoaches = useCallback(() => {
    return dispatch(fetchCoachesThunk());
  }, [dispatch]);

  const getLogs = useCallback(() => {
    return dispatch(fetchLogsThunk());
  }, [dispatch]);

  const getSettings = useCallback(() => {
    return dispatch(fetchSettingsThunk());
  }, [dispatch]);

  const updateSettings = useCallback((settings: any) => {
    return dispatch(updateSettingsThunk(settings));
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearAdminError());
  }, [dispatch]);

  return {
    users,
    coaches,
    dashboardStats,
    logs,
    settings,
    isLoading,
    error,
    getDashboard,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleStatus,
    getCoaches,
    getLogs,
    getSettings,
    updateSettings,
    clearError,
  };
};

export default useAdmin;
