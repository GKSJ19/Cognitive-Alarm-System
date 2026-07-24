import api from './api';
import { Alarm, AlarmHistory } from '../types/alarm.types';

export const alarmService = {
  async getAlarms(): Promise<Alarm[]> {
    const response = await api.get<Alarm[]>('/alarms');
    return response.data;
  },

  async createAlarm(data: Partial<Alarm>): Promise<Alarm> {
    const response = await api.post<Alarm>('/alarms', data);
    return response.data;
  },

  async updateAlarm(alarmId: string, data: Partial<Alarm>): Promise<Alarm> {
    const response = await api.put<Alarm>(`/alarms/${alarmId}`, data);
    return response.data;
  },

  async deleteAlarm(alarmId: string): Promise<void> {
    await api.delete(`/alarms/${alarmId}`);
  },

  async getHistory(): Promise<AlarmHistory[]> {
    const response = await api.get<AlarmHistory[]>('/alarms/history');
    return response.data;
  },

  async dismissAlarm(alarmId: string, wakeTime: string, solved: boolean, solveTime: number): Promise<AlarmHistory> {
    const response = await api.post<AlarmHistory>('/alarms/dismiss', {
      alarm_id: alarmId,
      wake_time: wakeTime,
      solved,
      solve_time: solveTime,
    });
    return response.data;
  }
};

export default alarmService;
