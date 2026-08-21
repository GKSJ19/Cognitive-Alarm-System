/**
 * settings.api.ts
 * ---------------------------------------------------------------------------
 * Thin re-export over auth.api.ts's /users/me endpoints, named for what the
 * Settings/Onboarding screens conceptually do. Unlike the previous backend,
 * this one genuinely persists every field these screens collect
 * (preferred_wake_time, sleep_duration_mins, timezone, goal_type,
 * difficulty_pref) directly on the user record via PUT /users/me — no
 * splitting across multiple endpoints needed.
 *
 * Theme (dark mode) and notification preferences still have NO backend
 * field anywhere and stay local-only in settingsStore.
 * ---------------------------------------------------------------------------
 */
import { getMe, updateProfile, type BackendUserProfile, type UpdateProfilePayload } from "./auth.api";

export function getProfileSettings(): Promise<BackendUserProfile> {
  return getMe() as unknown as Promise<BackendUserProfile>;
}

export function updateProfileSettings(payload: UpdateProfilePayload): Promise<BackendUserProfile> {
  return updateProfile(payload);
}
