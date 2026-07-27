import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
  darkMode: boolean;
  notificationsEnabled: boolean;

  // Profile Setup Wizard output (see src/app/onboarding/profile-setup.tsx)
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

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: false,
      notificationsEnabled: true,

      profilePrefs: DEFAULT_PROFILE_PREFS,
      setProfilePrefs: (prefs) =>
        set((state) => ({
          profilePrefs: { ...state.profilePrefs, ...prefs },
          timezone: prefs.timezone ?? state.timezone,
          difficulty: prefs.difficulty ?? state.difficulty,
        })),

      timezone: DEFAULT_PROFILE_PREFS.timezone,
      setTimezone: (value) => set({ timezone: value }),
      difficulty: DEFAULT_PROFILE_PREFS.difficulty,
      setDifficulty: (value) => set({ difficulty: value }),

      notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
      setNotificationPrefs: (prefs) =>
        set((state) => ({ notificationPrefs: { ...state.notificationPrefs, ...prefs } })),

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (value) => set({ darkMode: value }),
      toggleNotifications: () =>
        set((state) => ({
          notificationsEnabled: !state.notificationsEnabled,
        })),
    }),
    {
      name: "wakewise-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
