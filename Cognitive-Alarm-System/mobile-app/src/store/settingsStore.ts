import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import * as settingsApi from "@/services/api/settings.api";
import {
  timezoneDisplayToIana,
  timezoneIanaToDisplay,
  difficultyDisplayToBackend,
  difficultyBackendToDisplay,
  goalDisplayToBackend,
  goalBackendToDisplay,
  hoursToMinutes,
  minutesToHours,
  backendTimeToShort,
} from "@/utils/backendMappings";

export interface ProfilePrefs {
  wakeTime: string;
  sleepDuration: number;
  timezone: string;
  goal: string;
  difficulty: string;
}

export interface NotificationPrefs {
  push: boolean;
  email: boolean;
  sound: boolean;
  recommendations: boolean;
  habitReminders: boolean;
}

interface SettingsState {
  // Theme & notification preferences have NO backend field anywhere (see
  // settings.api.ts) — they stay purely local, same as before.
  darkMode: boolean;
  notificationsEnabled: boolean;

  // Profile Setup Wizard output (see src/app/onboarding/profile-setup.tsx).
  // These fields DO sync to the backend via PUT /users/me.
  profilePrefs: ProfilePrefs;
  setProfilePrefs: (prefs: Partial<ProfilePrefs>) => void;

  // Settings > Timezone / Difficulty (also editable individually)
  timezone: string;
  setTimezone: (value: string) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;

  // Settings > Notification Preferences
  notificationPrefs: NotificationPrefs;
  setNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void;

  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  toggleNotifications: () => void;

  isSyncing: boolean;
  syncError: string | null;
  /** Pulls timezone/difficulty/goal/wakeTime/sleepDuration from the backend (call once after login). */
  hydrateFromBackend: () => Promise<void>;
}

const DEFAULT_PROFILE_PREFS: ProfilePrefs = {
  wakeTime: "07:00",
  sleepDuration: 8,
  timezone: "GMT+05:30 (India)",
  goal: "Better Sleep",
  difficulty: "Medium",
};

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  push: true,
  email: false,
  sound: true,
  recommendations: true,
  habitReminders: true,
};

/**
 * Fires the profile update in the background without blocking the UI —
 * these setters are used from simple tap-to-select screens (Timezone,
 * Difficulty) that were never built to await a network call. Failures are
 * surfaced via `syncError` rather than thrown, since the local selection
 * should still "stick" even if the sync to the backend fails.
 */
function syncProfileInBackground(
  set: (partial: Partial<SettingsState>) => void,
  payload: Parameters<typeof settingsApi.updateProfileSettings>[0]
) {
  set({ isSyncing: true, syncError: null });
  settingsApi
    .updateProfileSettings(payload)
    .then(() => set({ isSyncing: false }))
    .catch((err) => {
      set({
        isSyncing: false,
        syncError: err instanceof Error ? err.message : "Couldn't sync your settings.",
      });
    });
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      notificationsEnabled: true,

      profilePrefs: DEFAULT_PROFILE_PREFS,
      setProfilePrefs: (prefs) => {
        set((state) => ({
          profilePrefs: { ...state.profilePrefs, ...prefs },
          timezone: prefs.timezone ?? state.timezone,
          difficulty: prefs.difficulty ?? state.difficulty,
        }));
        syncProfileInBackground(set, {
          preferred_wake_time: prefs.wakeTime ? `${prefs.wakeTime}:00` : undefined,
          sleep_duration_mins: prefs.sleepDuration != null ? hoursToMinutes(prefs.sleepDuration) : undefined,
          timezone: prefs.timezone ? timezoneDisplayToIana(prefs.timezone) : undefined,
          goal_type: prefs.goal ? goalDisplayToBackend(prefs.goal) : undefined,
          difficulty_pref: prefs.difficulty ? difficultyDisplayToBackend(prefs.difficulty) : undefined,
        });
      },

      timezone: DEFAULT_PROFILE_PREFS.timezone,
      setTimezone: (value) => {
        set({ timezone: value });
        syncProfileInBackground(set, { timezone: timezoneDisplayToIana(value) });
      },

      difficulty: DEFAULT_PROFILE_PREFS.difficulty,
      setDifficulty: (value) => {
        set({ difficulty: value });
        syncProfileInBackground(set, { difficulty_pref: difficultyDisplayToBackend(value) });
      },

      notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
      setNotificationPrefs: (prefs) =>
        set((state) => ({ notificationPrefs: { ...state.notificationPrefs, ...prefs } })),

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (value) => set({ darkMode: value }),
      toggleNotifications: () =>
        set((state) => ({
          notificationsEnabled: !state.notificationsEnabled,
        })),

      isSyncing: false,
      syncError: null,

      hydrateFromBackend: async () => {
        try {
          const profile = await settingsApi.getProfileSettings();
          const current = get().profilePrefs;
          const nextPrefs: ProfilePrefs = {
            wakeTime: backendTimeToShort(profile.preferred_wake_time) ?? current.wakeTime,
            sleepDuration: minutesToHours(profile.sleep_duration_mins) ?? current.sleepDuration,
            timezone: timezoneIanaToDisplay(profile.timezone) ?? current.timezone,
            goal: goalBackendToDisplay(profile.goal_type) ?? current.goal,
            difficulty: difficultyBackendToDisplay(profile.difficulty_pref) ?? current.difficulty,
          };
          set({
            profilePrefs: nextPrefs,
            timezone: nextPrefs.timezone,
            difficulty: nextPrefs.difficulty,
          });
        } catch {
          // Non-fatal — keep whatever was persisted locally / the defaults.
        }
      },
    }),
    {
      name: "wakewise-settings",
      storage: createJSONStorage(() => AsyncStorage),
      // isSyncing/syncError are transient request state, not app settings.
      partialize: (state) => {
        const { isSyncing, syncError, ...rest } = state;
        return rest;
      },
    }
  )
);
