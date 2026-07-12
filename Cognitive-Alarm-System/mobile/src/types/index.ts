export type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  goal_type?: string;
  timezone?: string;
  preferred_wake_time?: string;
};

export type Alarm = {
  id: string;
  label?: string;
  time: string;
  alarm_type?: string;
  is_active?: boolean;
  days_of_week?: number[];
};

export type AnalyticsSummary = {
  alarms: number;
  activeAlarms: number;
  habitScore: number;
  sleepGoal: string;
  wakeGoal: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  created_at?: string;
};
