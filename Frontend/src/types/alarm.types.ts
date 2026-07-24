export interface Alarm {
  alarm_id: string;
  user_id: string;
  title: string;
  alarm_time: string;
  repeat_days: string | null; // e.g. "1,2,3,4,5"
  vibration: boolean;
  ringtone: string;
  snooze_enabled: boolean;
  snooze_duration: number;
  challenge_required: boolean;
  challenge_type: string;
  difficulty: string;
  is_active: boolean;
}

export interface AlarmHistory {
  history_id: string;
  alarm_id: string;
  wake_time: string;
  solved: boolean;
  solve_time: number;
  dismissed_at: string;
}

export interface AlarmState {
  alarms: Alarm[];
  history: AlarmHistory[];
  isLoading: boolean;
  error: string | null;
}
