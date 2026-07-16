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
  },

  async generateChallenge(challengeType: string, difficulty: string): Promise<any> {
    const response = await api.get('/challenges/generate', {
      params: { challenge_type: challengeType, difficulty }
    });
    return response.data;
  },

  async submitChallenge(challengeId: string, answer: string, alarmId: string, solveTime: number, attemptCount: number): Promise<any> {
    const response = await api.post('/challenges/submit', {
      challenge_id: challengeId,
      answer,
      alarm_id: alarmId,
      solve_time: solveTime,
      attempt_count: attemptCount
    });
    return response.data;
  }
};

export default alarmService;

