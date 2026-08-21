/**
 * dashboard.api.ts
 * ---------------------------------------------------------------------------
 * Maps to app/routers/dashboard.py in the ICAP backend.
 *
 * - GET /dashboard/user — any authenticated user.
 * - GET /dashboard/coach — requires role "wellness_coach" (backend 403s
 *   otherwise). Only fetch this if the logged-in user's role matches.
 * - GET /dashboard/admin — requires role "administrator", same as above.
 * - GET /analytics/system (administrator only) returns real, in-memory,
 *   single-process metrics: uptime, request/error counts, avg response
 *   time. It resets on backend restart and does NOT aggregate across
 *   multiple workers/replicas — fine for a single dev/demo instance, not
 *   a substitute for real APM in production.
 *
 * Known gap (flagged, not fixed here): `productivity_insights` on the user
 * dashboard reads from the `goal_metrics` table — as of the goals module
 * being wired up, GoalMetric now has a real writer (POST /goals/log), so
 * this will populate once a user logs at least one entry.
 * ---------------------------------------------------------------------------
 */
import { apiClient } from "./client";

// ---------- User dashboard ----------

export interface HabitScoreBlock {
  wake_consistency_score: number | null;
  challenge_success_score: number | null;
  snooze_reduction_score: number | null;
  sleep_adherence_score: number | null;
  total_score: number | null;
  insufficient_data: boolean;
  components_used: string[];
}

export interface AlarmHistoryEntry {
  alarm_label: string;
  triggered_at: string;
  dismissed_at: string | null;
  snooze_count: number;
  status: "passed" | "failed" | "pending" | string;
}

export interface WakeUpStats {
  window_days: number;
  snooze_trend: { weekly_average_snoozes: Record<string, number>; overall_average_snoozes: number };
  wake_time_consistency: { average_wake_minute_of_day: number | null; std_dev_minutes: number | null; sample_size: number };
  sleep_duration_vs_accuracy: { correlation: number | null; sample_size: number; note?: string };
}

export interface ChallengePerformanceSummary {
  total_attempts: number;
  correct_attempts: number;
  accuracy_percent: number;
}

export interface ProductivityInsight {
  date: string;
  goal_type: "study" | "work" | "fitness" | string;
  metric_label: string;
  value: number;
}

export interface UserDashboardResponse {
  habit_score: HabitScoreBlock;
  alarm_history: AlarmHistoryEntry[];
  wake_up_stats: WakeUpStats;
  challenge_performance: ChallengePerformanceSummary;
  productivity_insights: ProductivityInsight[];
}

export function getUserDashboard() {
  return apiClient.get<UserDashboardResponse>("/dashboard/user").then((r) => r.data);
}

// ---------- Coach dashboard ----------

export interface CoachUserSummary {
  user_id: string;
  name: string;
  habit_adherence: { latest_score: number | null; trend: "improving" | "declining" | "stable" | "no_data" | "insufficient_history" };
  sleep_trend: { average_duration_mins: number | null; sample_size: number };
  snooze_trend: { weekly_average_snoozes: Record<string, number>; overall_average_snoozes: number };
  wake_time_consistency: { average_wake_minute_of_day: number | null; std_dev_minutes: number | null; sample_size: number };
}

export interface CoachDashboardResponse {
  assigned_user_count: number;
  users: CoachUserSummary[];
}

export function getCoachDashboard() {
  return apiClient.get<CoachDashboardResponse>("/dashboard/coach").then((r) => r.data);
}

// ---------- Admin dashboard ----------

export interface AdminDashboardResponse {
  user_management: { total_users: number; active_users: number; by_role: Record<string, number> };
  platform_analytics: {
    total_alarms: number;
    active_alarms: number;
    total_alarm_triggers: number;
    total_challenge_attempts: number;
    average_habit_score_platform_wide: number | null;
  };
  recommendation_monitoring: { total_recommendations: number; unread: number; by_category: Record<string, number> };
  system_reports: { total_reports_generated: number; by_type: Record<string, number> };
}

export function getAdminDashboard() {
  return apiClient.get<AdminDashboardResponse>("/dashboard/admin").then((r) => r.data);
}

// ---------- System metrics (admin only) ----------

export interface SystemMetrics {
  uptime_seconds: number;
  request_count: number;
  error_count: number;
  error_rate_percent: number;
  avg_response_time_ms: number | null;
  sample_size: number;
  note: string;
}

export function getSystemMetrics() {
  return apiClient.get<SystemMetrics>("/analytics/system").then((r) => r.data);
}