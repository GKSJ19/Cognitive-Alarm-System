export const REPORT_TYPES = [
  "Sleep Summary",
  "Alarm & Wake-up History",
  "Habit Score Trend",
  "Challenge Performance",
  "Productivity Insights",
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];
