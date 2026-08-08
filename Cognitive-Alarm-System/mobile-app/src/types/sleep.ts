export interface DailySleepEntry {
  /** Short weekday label, e.g. "Mon" */
  day: string;
  /** ISO date string */
  date: string;
  hours: number;
  quality: number; // 0-100
}

export interface SleepSummary {
  averageHours: number;
  averageQuality: number;
  sleepScore: number; // 0-100
  weekly: DailySleepEntry[];
  monthly: { week: string; hours: number }[];
}
