/**
 * goal.api.ts
 * ---------------------------------------------------------------------------
 * Maps to app/routers/goal.py in the ICAP backend (added to close the
 * productivity_insights/goal_metrics gap — this table previously had no
 * writer anywhere).
 *
 * Backend notes:
 * - GoalMetric is a raw metric LOG, not a goal-with-target. There is no
 *   "target value" or "% complete" concept anywhere in the schema — just
 *   { date, goal_type, metric_label, metric_value }. Don't render this as
 *   a progress bar implying a target; render it as a log of entries.
 * - goal_type must be one of "study" | "work" | "fitness" (GoalType enum).
 * ---------------------------------------------------------------------------
 */
import { apiClient } from "./client";

export type BackendGoalType = "study" | "work" | "fitness";

export interface GoalMetricEntry {
  id: string;
  date: string; // "YYYY-MM-DD"
  goal_type: BackendGoalType;
  metric_label: string;
  metric_value: number;
}

export interface LogGoalMetricPayload {
  date: string;
  goal_type: BackendGoalType;
  metric_label: string;
  metric_value: number;
}

export function logGoalMetric(payload: LogGoalMetricPayload) {
  return apiClient.post<GoalMetricEntry>("/goals/log", payload).then((r) => r.data);
}

export function getGoalHistory() {
  return apiClient.get<GoalMetricEntry[]>("/goals/history").then((r) => r.data);
}

export function deleteGoalMetric(id: string) {
  return apiClient.delete<{ message: string }>(`/goals/${id}`).then((r) => r.data);
}