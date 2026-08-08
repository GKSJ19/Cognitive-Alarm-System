/**
 * backendMappings.ts
 * ---------------------------------------------------------------------------
 * The frontend's Settings / Profile Setup screens use human-readable
 * display strings ("GMT+05:30 (India)", "Extreme") that don't exist on the
 * backend, which expects IANA timezone names and specific enum values
 * (see app/models/user.py, app/models/challenge.py). These tables are the
 * single source of truth for translating between the two, so every screen
 * that touches these fields converts consistently.
 * ---------------------------------------------------------------------------
 */

// -- Timezone -----------------------------------------------------------
// Backend `timezone` is a free-text column (no enum), but is meant to hold
// an IANA zone name (defaults to "Asia/Kolkata" — see models/user.py).
export const TIMEZONE_DISPLAY_TO_IANA: Record<string, string> = {
  "GMT+05:30 (India)": "Asia/Kolkata",
  "GMT+00:00 (UTC)": "UTC",
  "GMT-05:00 (US Eastern)": "America/New_York",
  "GMT-08:00 (US Pacific)": "America/Los_Angeles",
  "GMT+01:00 (CET)": "Europe/Paris",
  "GMT+09:00 (Japan)": "Asia/Tokyo",
};

export function timezoneDisplayToIana(display: string): string {
  return TIMEZONE_DISPLAY_TO_IANA[display] ?? display;
}

// -- Difficulty -----------------------------------------------------------
// Backend Difficulty enum (app/models/challenge.py): beginner, easy,
// medium, hard, expert. The Settings/Onboarding UI only offers four
// labels, so "Extreme" is mapped to the closest backend value, "expert".
// NOTE: saving this has no effect on actual challenge difficulty — see
// difficulty.api.ts. It's persisted for completeness only.
export const DIFFICULTY_DISPLAY_TO_BACKEND: Record<string, string> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
  Extreme: "expert",
};

export function difficultyDisplayToBackend(display: string): string {
  return DIFFICULTY_DISPLAY_TO_BACKEND[display] ?? display.toLowerCase();
}

// -- Goal type -----------------------------------------------------------
// Backend GoalType enum (app/models/challenge.py): study, work, fitness.
// The onboarding wizard's goal options don't line up 1:1 with these —
// only "Fitness" has a direct match, and "Productivity" reasonably maps to
// "work". "Better Sleep" and "Consistent Routine" have no backend
// equivalent at all, so they intentionally map to `null` (the field is
// nullable) rather than guessing a wrong category — the challenge engine
// falls back to picking a random category when goal_type is null.
export const GOAL_DISPLAY_TO_BACKEND: Record<string, string | null> = {
  "Better Sleep": null,
  "Consistent Routine": null,
  Productivity: "work",
  Fitness: "fitness",
};

export function goalDisplayToBackend(display: string): string | null {
  return display in GOAL_DISPLAY_TO_BACKEND ? GOAL_DISPLAY_TO_BACKEND[display] : null;
}

/** "8" (hours, possibly "7.5") -> whole minutes for sleep_duration_mins */
export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60);
}

export function minutesToHours(minutes: number | null | undefined): number | null {
  return minutes == null ? null : Math.round((minutes / 60) * 2) / 2; // nearest 0.5h
}

// -- Reverse lookups, for hydrating the UI from a backend profile --------
const IANA_TO_TIMEZONE_DISPLAY: Record<string, string> = Object.fromEntries(
  Object.entries(TIMEZONE_DISPLAY_TO_IANA).map(([display, iana]) => [iana, display])
);
export function timezoneIanaToDisplay(iana: string | null | undefined): string | null {
  if (!iana) return null;
  return IANA_TO_TIMEZONE_DISPLAY[iana] ?? null;
}

const BACKEND_TO_DIFFICULTY_DISPLAY: Record<string, string> = {
  beginner: "Easy",
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  expert: "Extreme",
};
export function difficultyBackendToDisplay(value: string | null | undefined): string | null {
  if (!value) return null;
  return BACKEND_TO_DIFFICULTY_DISPLAY[value] ?? null;
}

const BACKEND_TO_GOAL_DISPLAY: Record<string, string> = {
  work: "Productivity",
  fitness: "Fitness",
  // "study" has no corresponding display option in the current UI.
};
export function goalBackendToDisplay(value: string | null | undefined): string | null {
  if (!value) return null;
  return BACKEND_TO_GOAL_DISPLAY[value] ?? null;
}

/** "07:00:00" (backend) -> "07:00" (frontend TimePickerField format) */
export function backendTimeToShort(time: string | null | undefined): string | null {
  if (!time) return null;
  return time.slice(0, 5);
}
