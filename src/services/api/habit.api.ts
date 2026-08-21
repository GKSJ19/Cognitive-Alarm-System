/**
 * habit.api.ts
 * ---------------------------------------------------------------------------
 * Maps to app/routers/habit.py in the ICAP backend.
 *
 * - GET /habit/score returns TODAY's score + breakdown. Any category can be
 *   null if there's insufficient data in the trailing 7-day window.
 * - GET /habit/history?year=&month= returns a day-by-day status list for
 *   that calendar month, derived from alarm_triggers (passed + no snoozes
 *   = "success", passed with snoozes = "snoozed", not passed = "missed",
 *   no alarm that day = "none", future dates = "future").
 * - GET /habit/streaks returns { current_streak, best_streak } in days,
 *   also derived from alarm_triggers. Days with no alarm at all don't
 *   break or extend a streak.
 * - There is NO "Goal Progress" category on the backend.
 * ---------------------------------------------------------------------------
 */
import { apiClient } from "./client";

export interface HabitScoreResponse {
  date: string;
  wake_consistency_score: number | null;
  challenge_success_score: number | null;
  snooze_reduction_score: number | null;
  sleep_adherence_score: number | null;
  total_score: number | null;
  insufficient_data: boolean;
  components_used: string[];
}

export type CalendarDayStatus = "success" | "missed" | "snoozed" | "future" | "none";

export interface BackendCalendarDay {
  date: string; // ISO date
  day: number;
  status: CalendarDayStatus;
}

export interface StreaksResponse {
  current_streak: number;
  best_streak: number;
}

export function getHabitScore() {
  return apiClient.get<HabitScoreResponse>("/habit/score").then((r) => r.data);
}

export function getHabitHistory(year: number, month: number) {
  // month is 1-12 on the backend
  return apiClient
    .get<BackendCalendarDay[]>("/habit/history", { params: { year, month } })
    .then((r) => r.data);
}

export function getHabitStreaks() {
  return apiClient.get<StreaksResponse>("/habit/streaks").then((r) => r.data);
}