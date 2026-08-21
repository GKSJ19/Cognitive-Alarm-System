/**
 * notification.api.ts
 * ---------------------------------------------------------------------------
 * Maps 1:1 to app/routers/notification.py in the ICAP backend.
 *
 * Backend notes:
 * - GET /notify returns { total, unread_count, notifications: [...] }.
 *   Each item is { id, type, message, sent_at, read_at }. There is NO
 *   separate "title" field and NO icon field — the backend only stores
 *   `type` (e.g. "wake_up_reminder", "habit_alert", "bedtime_reminder",
 *   "challenge_reminder", "progress", "platform_announcement") and a
 *   pre-composed `message`. Title + icon are derived client-side from
 *   `type` below.
 * - PATCH /notify/{id}/read marks one as read; PATCH /notify/read-all
 *   marks every unread one read; DELETE /notify/{id} removes one.
 * ---------------------------------------------------------------------------
 */
import { apiClient } from "./client";

export type BackendNotificationType =
  | "wake_up_reminder"
  | "challenge_reminder"
  | "habit_alert"
  | "progress"
  | "platform_announcement"
  | "bedtime_reminder"
  | string; // backend doesn't constrain this at the DB level

export interface BackendNotification {
  id: string;
  type: BackendNotificationType;
  message: string;
  sent_at: string;
  read_at: string | null;
}

export interface NotificationListResponse {
  total: number;
  unread_count: number;
  notifications: BackendNotification[];
}

export function listNotifications(params?: { unread_only?: boolean; limit?: number; offset?: number }) {
  return apiClient.get<NotificationListResponse>("/notify", { params }).then((r) => r.data);
}

export function getUnreadCount() {
  return apiClient.get<{ unread_count: number }>("/notify/unread-count").then((r) => r.data);
}

export function markAllRead() {
  return apiClient.patch<{ marked_read: number }>("/notify/read-all").then((r) => r.data);
}

export function markRead(id: string) {
  return apiClient.patch<{ id: string; read_at: string }>(`/notify/${id}/read`).then((r) => r.data);
}

export function deleteNotification(id: string) {
  return apiClient.delete<{ message: string }>(`/notify/${id}`).then((r) => r.data);
}