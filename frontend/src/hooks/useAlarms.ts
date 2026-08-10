import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchAlarmsThunk, 
  createAlarmThunk, 
  updateAlarmThunk, 
  deleteAlarmThunk, 
  fetchAlarmHistoryThunk, 
  dismissAlarmThunk, 
  clearAlarmError 
} from '../store/slices/alarmSlice';
import { Alarm } from '../types/alarm.types';

export const useAlarms = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { alarms, history, isLoading, error } = useSelector((state: RootState) => state.alarms);

  const getAlarms = useCallback(() => {
    return dispatch(fetchAlarmsThunk());
  }, [dispatch]);

  const createAlarm = useCallback((data: Partial<Alarm>) => {
    return dispatch(createAlarmThunk(data));
  }, [dispatch]);

  const updateAlarm = useCallback((alarmId: string, data: Partial<Alarm>) => {
    return dispatch(updateAlarmThunk({ alarmId, data }));
  }, [dispatch]);

  const deleteAlarm = useCallback((alarmId: string) => {
    return dispatch(deleteAlarmThunk(alarmId));
  }, [dispatch]);

  const getHistory = useCallback(() => {
    return dispatch(fetchAlarmHistoryThunk());
  }, [dispatch]);

  const dismissAlarm = useCallback((alarmId: string, wakeTime: string, solved: boolean, solveTime: number) => {
    return dispatch(dismissAlarmThunk({ alarmId, wakeTime, solved, solveTime }));
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearAlarmError());
  }, [dispatch]);

  return {
    alarms,
    history,
    isLoading,
    error,
    getAlarms,
    createAlarm,
    updateAlarm,
    deleteAlarm,
    getHistory,
    dismissAlarm,
    clearError,
  };
};

export default useAlarms;
