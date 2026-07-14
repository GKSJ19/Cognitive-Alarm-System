export type WeekDay = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

export const WEEK_DAYS: WeekDay[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export interface Alarm {
  id: string;
  /** 24h "HH:mm" format, e.g. "07:30" */
  time: string;
  label: string;
  repeatDays: WeekDay[];
  enabled: boolean;
  sound: string;
  snoozeEnabled: boolean;
  snoozeDurationMinutes: number;
  vibration: boolean;
  createdAt: number;
}

export type AlarmDraft = Omit<Alarm, "id" | "createdAt">;

export const ALARM_SOUNDS = [
  "Classic Chime",
  "Morning Birds",
  "Gentle Piano",
  "Digital Beep",
  "Ocean Waves",
] as const;

export type AlarmSound = (typeof ALARM_SOUNDS)[number];
