/**
 * challenge.api.ts
 * ---------------------------------------------------------------------------
 * Maps 1:1 to app/routers/challenges.py in the ICAP backend.
 *
 * Backend notes (important — this shapes the whole Challenge UI):
 * - `GET /challenges/generate` returns only `{ challenge_id, category,
 *   question }` — a plain-text question. The correct answer is never sent
 *   to the client; it's checked server-side in `POST /challenges/verify`.
 * - There are NO multiple-choice options, no structured sequence/pattern
 *   data, and no images in the response — every category (math, logic,
 *   memory, word_game, pattern, riddle, quiz) is a free-text Q&A.
 * - `category` values are: "math" | "logic" | "memory" | "word_game" |
 *   "pattern" | "riddle" | "quiz". Note this differs from the old
 *   frontend's ChallengeType ("word" not "word_game", "memory-sequence"/
 *   "image-sequence" instead of "memory", no image-sequence equivalent at
 *   all on the backend).
 * - This endpoint does NOT accept a `difficulty` or `goal_type` param —
 *   difficulty is computed server-side from the user's last 10 attempts,
 *   and goal_type is read from the user's saved profile.
 * ---------------------------------------------------------------------------
 */
import { apiClient } from "./client";

export type BackendChallengeCategory =
  | "math"
  | "logic"
  | "memory"
  | "word_game"
  | "pattern"
  | "riddle"
  | "quiz";

export interface ChallengeGenerateResponse {
  challenge_id: string;
  category: BackendChallengeCategory;
  question: string;
}

export interface ChallengeVerifyPayload {
  challenge_id: string;
  submitted_answer: string;
  alarm_trigger_id?: string | null;
  time_taken_seconds?: number | null;
}

export interface ChallengeVerifyResponse {
  is_correct: boolean;
}

export interface ChallengeStatsResponse {
  total_attempts: number;
  correct_attempts: number;
  accuracy_percent: number;
  by_category: Record<string, { total: number; correct: number; accuracy_percent: number }>;
}

export function generateChallenge() {
  return apiClient.get<ChallengeGenerateResponse>("/challenges/generate").then((r) => r.data);
}

export function verifyChallenge(payload: ChallengeVerifyPayload) {
  return apiClient.post<ChallengeVerifyResponse>("/challenges/verify", payload).then((r) => r.data);
}

export function getChallengeStats() {
  return apiClient.get<ChallengeStatsResponse>("/challenges/stats").then((r) => r.data);
}
