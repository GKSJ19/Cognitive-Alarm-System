import { HabitCategoryScore, CalendarDayStatus } from "@/types/habit";

/** No habit-analytics backend yet — mirrors the shape a real endpoint would return. */
export const HABIT_SCORE = 82;

export const HABIT_BREAKDOWN: HabitCategoryScore[] = [
  { label: "Wake-up Consistency", score: 88, icon: "alarm-check" },
  { label: "Challenge Completion", score: 76, icon: "puzzle-check-outline" },
  { label: "Snooze Discipline", score: 64, icon: "sleep" },
  { label: "Sleep Duration", score: 90, icon: "moon-waning-crescent" },
  { label: "Goal Progress", score: 71, icon: "target" },
];

export const CURRENT_STREAK = 12;
export const BEST_STREAK = 27;

export function getCalendarHistory(year: number, month: number): CalendarDayStatus[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(year, month, day);
    let status: CalendarDayStatus["status"] = "none";

    if (date > today) {
      status = "future";
    } else {
      // Deterministic pseudo-random pattern so re-renders stay stable.
      const seed = (day * 37 + month * 11) % 10;
      status = seed < 6 ? "success" : seed < 8 ? "snoozed" : "missed";
    }

    return { date: date.toISOString(), day, status };
  });
}
