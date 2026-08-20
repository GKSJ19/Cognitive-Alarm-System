/**
 * Analytics API Client — Milestone 3
 *
 * Provides typed API functions for all analytics endpoints.
 */

import { apiClient } from "./apiClient";
import type {
  BehaviorAnalyticsData,
  HabitScoreData,
  HabitScoreHistoryItem,
  RecommendationData,
  DifficultyHistoryItem,
  CurrentDifficulty,
  UserStatisticsData,
  DashboardData,
} from "../types";

// ── Behavioral Analytics ───────────────────────────────────────────────────

export async function getBehavioralAnalytics(days = 30) {
  const res = await apiClient.get<{ success: boolean; data: BehaviorAnalyticsData[] }>(
    `/analytics/behavioral?days=${days}`
  );
  return res.data.data;
}

export async function computeBehavioralAnalytics() {
  const res = await apiClient.post<{ success: boolean; data: BehaviorAnalyticsData }>(
    "/analytics/behavioral/compute"
  );
  return res.data.data;
}

// ── Habit Score ────────────────────────────────────────────────────────────

export async function getHabitScore() {
  const res = await apiClient.get<{ success: boolean; data: HabitScoreData }>(
    "/analytics/habit-score"
  );
  return res.data.data;
}

export async function getHabitScoreHistory(days = 30) {
  const res = await apiClient.get<{ success: boolean; data: HabitScoreHistoryItem[] }>(
    `/analytics/habit-score/history?days=${days}`
  );
  return res.data.data;
}

// ── Recommendations ────────────────────────────────────────────────────────

export async function getRecommendations() {
  const res = await apiClient.get<{ success: boolean; data: RecommendationData[] }>(
    "/analytics/recommendations"
  );
  return res.data.data;
}

export async function generateRecommendations() {
  const res = await apiClient.post<{ success: boolean; data: any[] }>(
    "/analytics/recommendations/generate"
  );
  return res.data.data;
}

export async function dismissRecommendation(recommendationId: string) {
  const res = await apiClient.post<{ success: boolean; data: { dismissed: boolean } }>(
    "/analytics/recommendations/dismiss",
    { recommendation_id: recommendationId }
  );
  return res.data.data;
}

// ── Adaptive Difficulty ────────────────────────────────────────────────────

export async function getCurrentDifficulty() {
  const res = await apiClient.get<{ success: boolean; data: CurrentDifficulty }>(
    "/analytics/difficulty"
  );
  return res.data.data;
}

export async function getDifficultyHistory(limit = 20) {
  const res = await apiClient.get<{ success: boolean; data: DifficultyHistoryItem[] }>(
    `/analytics/difficulty/history?limit=${limit}`
  );
  return res.data.data;
}

export async function computeDifficulty() {
  const res = await apiClient.post<{ success: boolean; data: any }>(
    "/analytics/difficulty/compute"
  );
  return res.data.data;
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export async function getDailyDashboard() {
  const res = await apiClient.get<{ success: boolean; data: DashboardData }>(
    "/analytics/dashboard/daily"
  );
  return res.data.data;
}

export async function getWeeklyDashboard() {
  const res = await apiClient.get<{ success: boolean; data: DashboardData }>(
    "/analytics/dashboard/weekly"
  );
  return res.data.data;
}

export async function getMonthlyDashboard() {
  const res = await apiClient.get<{ success: boolean; data: DashboardData }>(
    "/analytics/dashboard/monthly"
  );
  return res.data.data;
}

// ── User Statistics ────────────────────────────────────────────────────────

export async function getUserStatistics() {
  const res = await apiClient.get<{ success: boolean; data: UserStatisticsData }>(
    "/analytics/statistics"
  );
  return res.data.data;
}
