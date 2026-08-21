/**
 * alarm.api.ts
 * ---------------------------------------------------------------------------
 * Maps 1:1 to app/routers/alarms.py in the ICAP backend.
 *
 * Backend notes:
 * - The Alarm model only has: time, alarm_type, days_of_week, is_active,
 *   label. There is NO sound / snooze / vibration field on the backend.
 *   Those remain client-only and are merged in by alarmStore.ts.
 * - There is no dedicated "toggle" endpoint — toggling is just
 *   `PUT /alarms/{id}` with `{ is_active }`.
 * - `DELETE /alarms/{id}` is a soft-delete (sets is_active = false), and
 *   `GET /alarms/` only returns alarms where is_active = true. That means
 *   a "deleted" alarm and a "disabled" alarm look identical to the backend
 *   right now. This is a backend limitation, not something fixable from
 *   the frontend — flagged in the integration report.
 * ---------------------------------------------------------------------------
 */
import { apiClient } from "./client";

export type BackendAlarmType = "daily" | "weekday" | "weekend" | "one_time" | "smart_adaptive";

export interface BackendAlarm {
  id: string;
  time: string; // "HH:MM:SS"
  alarm_type: BackendAlarmType;
  days_of_week: number[] | null;
  is_active: boolean;
  label: string | null;
}

export interface CreateAlarmPayload {
  time: string; // "HH:MM:SS"
  alarm_type: BackendAlarmType;
  days_of_week?: number[] | null;
  label?: string | null;
}

export type UpdateAlarmPayload = Partial<CreateAlarmPayload> & { is_active?: boolean };

export function listAlarms() {
  return apiClient.get<BackendAlarm[]>("/alarms/").then((r) => r.data);
}

export function createAlarm(payload: CreateAlarmPayload) {
  return apiClient.post<BackendAlarm>("/alarms/", payload).then((r) => r.data);
}

export function updateAlarm(id: string, payload: UpdateAlarmPayload) {
  return apiClient.put<BackendAlarm>(`/alarms/${id}`, payload).then((r) => r.data);
}

export function deleteAlarm(id: string) {
  return apiClient.delete<{ message: string }>(`/alarms/${id}`).then((r) => r.data);
}
