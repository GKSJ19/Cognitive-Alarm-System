import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Alarm, AlarmDraft } from "@/types/alarm";
import { DUMMY_ALARMS } from "@/data/alarms";

interface AlarmState {
  alarms: Alarm[];
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;
  addAlarm: (draft: AlarmDraft) => Alarm;
  updateAlarm: (id: string, draft: AlarmDraft) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string, enabled?: boolean) => void;
  getAlarmById: (id: string) => Alarm | undefined;
}

export const useAlarmStore = create<AlarmState>()(
  persist(
    (set, get) => ({
      // Seeded with dummy data on first launch; persisted after that.
      alarms: DUMMY_ALARMS,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      addAlarm: (draft) => {
        const alarm: Alarm = {
          ...draft,
          id: `alarm-${Date.now()}`,
          createdAt: Date.now(),
        };
        set((state) => ({ alarms: [alarm, ...state.alarms] }));
        return alarm;
      },

      updateAlarm: (id, draft) => {
        set((state) => ({
          alarms: state.alarms.map((a) =>
            a.id === id ? { ...a, ...draft } : a
          ),
        }));
      },

      deleteAlarm: (id) => {
        set((state) => ({
          alarms: state.alarms.filter((a) => a.id !== id),
        }));
      },

      toggleAlarm: (id, enabled) => {
        set((state) => ({
          alarms: state.alarms.map((a) =>
            a.id === id ? { ...a, enabled: enabled ?? !a.enabled } : a
          ),
        }));
      },

      getAlarmById: (id) => get().alarms.find((a) => a.id === id),
    }),
    {
      name: "wakewise-alarms",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ alarms: state.alarms }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
