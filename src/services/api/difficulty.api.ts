/**
 * difficulty.api.ts
 * ---------------------------------------------------------------------------
 * Maps 1:1 to app/routers/difficulty.py in the ICAP backend.
 *
 * IMPORTANT: this is READ-ONLY. Difficulty is computed server-side from
 * the user's last 10 challenge attempts (see app/services/difficulty_service.py)
 * — beginner/easy/medium/hard/expert based on rolling accuracy. There is no
 * endpoint to set a difficulty preference; `difficulty_pref` on the user
 * profile is stored (via PUT /users/me) but is never read by the challenge
 * generator. The Settings > Difficulty screen is wired to save
 * `difficulty_pref` for completeness, but it does not change what
 * difficulty challenges are actually generated at.
 * ---------------------------------------------------------------------------
 */
import { apiClient } from "./client";

export type BackendDifficulty = "beginner" | "easy" | "medium" | "hard" | "expert";

export interface DifficultyResponse {
  difficulty: BackendDifficulty;
  recent_accuracy_percent: number;
  recent_attempts_considered: number;
}

export function getCurrentDifficulty() {
  return apiClient.get<DifficultyResponse>("/difficulty/current").then((r) => r.data);
}
