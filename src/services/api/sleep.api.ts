/**
 * sleep.api.ts
 * ---------------------------------------------------------------------------
 * Maps 1:1 to app/routers/sleep.py in the ICAP backend.
 *
 * Backend notes:
 * - POST /sleep/log body: { date, sleep_start?, sleep_end?, duration_mins?,
 *   quality?, source } — date is "YYYY-MM-DD", sleep_start/sleep_end are
 *   ISO datetimes. If duration_mins is omitted but start+end are given,
 *   the backend computes duration itself.
 * - `quality` is a 1-5 star rating, optional, validated server-side
 *   (Pydantic `ge=1, le=5`). Added after the initial integration pass —
 *   previously client-only.
 * - GET /sleep/history returns all logs for the user, newest first. There
 *   is no weekly/monthly aggregation endpoint — that's computed client-side
 *   from the raw history list.
 * ---------------------------------------------------------------------------
 */
import { apiClient } from "./client";

export interface BackendSleepLog {
  id: string;
  date: string; // "YYYY-MM-DD"
  sleep_start: string | null;
  sleep_end: string | null;
  duration_mins: number | null;
  quality: number | null;
  source: string;
}

export interface LogSleepPayload {
  date: string; // "YYYY-MM-DD"
  sleep_start?: string | null; // ISO datetime
  sleep_end?: string | null; // ISO datetime
  duration_mins?: number | null;
  quality?: number | null; // 1-5
  source?: string; // defaults to "manual" server-side
}

export function logSleep(payload: LogSleepPayload) {
  return apiClient.post<BackendSleepLog>("/sleep/log", payload).then((r) => r.data);
}

export function getSleepHistory() {
  return apiClient.get<BackendSleepLog[]>("/sleep/history").then((r) => r.data);
}