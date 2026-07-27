export interface HabitCategoryScore {
  label: string;
  score: number; // 0-100
  icon: string;
}

export interface CalendarDayStatus {
  date: string; // ISO date
  day: number;
  status: "success" | "missed" | "snoozed" | "future" | "none";
}
