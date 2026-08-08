/**
 * verification.api.ts
 * ---------------------------------------------------------------------------
 * Maps 1:1 to app/routers/verification.py in the ICAP backend.
 *
 * This is the endpoint pair actually meant to back the "alarm rings ->
 * solve a challenge -> alarm dismissed" flow (as opposed to
 * challenge.api.ts's /challenges/generate + /verify, which are a more
 * generic, trigger-less pair). `verification.api.ts` is used from
 * alarm-ringing/[id].tsx and challenge/[type].tsx.
 * ---------------------------------------------------------------------------
 */
import { apiClient } from "./client";
import type { BackendChallengeCategory } from "./challenge.api";

export interface TriggerAlarmResponse {
  trigger_id: string;
  challenge_id: string;
  category: BackendChallengeCategory;
  question: string;
}

export interface VerifyAttemptPayload {
  trigger_id: string;
  challenge_id: string;
  submitted_answer: string;
}

export interface VerifyAttemptResponse {
  is_correct: boolean;
  verification_status: "pending" | "passed" | "failed";
  total_attempts: number;
}

export function triggerAlarm(alarm_id: string) {
  return apiClient.post<TriggerAlarmResponse>("/verify/trigger", { alarm_id }).then((r) => r.data);
}

export function verifyAttempt(payload: VerifyAttemptPayload) {
  return apiClient.post<VerifyAttemptResponse>("/verify/attempt", payload).then((r) => r.data);
}
