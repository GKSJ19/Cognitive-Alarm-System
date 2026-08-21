import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Alarm, AlarmDraft, WeekDay, WEEK_DAYS } from "@/types/alarm";
import * as alarmApi from "@/services/api/alarm.api";
import type { BackendAlarm, BackendAlarmType } from "@/services/api/alarm.api";
import { ApiError } from "@/services/api/errors";
import {
  scheduleAlarmNotifications,
  cancelAlarmNotifications,
  resyncAllAlarms,
} from "@/services/notifications/alarmScheduler";

/**
 * ---------------------------------------------------------------------------
 * Mapping between the frontend Alarm shape and the backend Alarm model.
 *
 * The backend (app/models/alarm.py) only has: time, alarm_type,
 * days_of_week, is_active, label. There is NO sound / snoozeEnabled /
 * snoozeDurationMinutes / vibration column on the backend at all — those
 * are purely client-side preferences. They're kept in `localExtras` below,
 * keyed by alarm id, persisted locally, and merged into the Alarm objects
 * the rest of the app reads — so every existing screen that reads
 * `alarm.sound` / `alarm.snoozeEnabled` / `alarm.vibration` keeps working
 * exactly as before, it's just backed by local storage instead of the
 * server for those specific fields.
 *
 * `days_of_week` is a plain int array server-side that the backend never
 * interprets (no scheduler reads it) — so the 0=Sun..6=Sat convention
 * below is this frontend's own choice, consistently applied both ways.
 * ---------------------------------------------------------------------------
 */

interface LocalAlarmExtras {
  sound: string;
  snoozeEnabled: boolean;
  snoozeDurationMinutes: number;
  vibration: boolean;
}

const DEFAULT_EXTRAS: LocalAlarmExtras = {
  sound: "Classic Chime",
  snoozeEnabled: true,
  snoozeDurationMinutes: 10,
  vibration: true,
};

function weekDaysToInts(days: WeekDay[]): number[] {
  return days.map((d) => WEEK_DAYS.indexOf(d)).sort((a, b) => a - b);
}

function intsToWeekDays(days: number[] | null | undefined): WeekDay[] {
  if (!days) return [];
  return days
    .filter((i) => i >= 0 && i < WEEK_DAYS.length)
    .sort((a, b) => a - b)
    .map((i) => WEEK_DAYS[i]);
}

function repeatDaysToAlarmType(days: WeekDay[]): BackendAlarmType {
  if (days.length === 0) return "one_time";
  if (days.length === 7) return "daily";
  const isWeekdays = days.length === 5 && ["Mon", "Tue", "Wed", "Thu", "Fri"].every((d) => days.includes(d as WeekDay));
  if (isWeekdays) return "weekday";
  const isWeekend = days.length === 2 && ["Sat", "Sun"].every((d) => days.includes(d as WeekDay));
  if (isWeekend) return "weekend";
  // Custom combination — no dedicated backend enum value for this, "daily"
  // is the closest fit and days_of_week still carries the exact selection.
  return "daily";
}

/** "07:30" (frontend) <-> "07:30:00" (backend pydantic `time`) */
function toBackendTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}
function fromBackendTime(time: string): string {
  return time.slice(0, 5);
}

function toAlarm(backendAlarm: BackendAlarm, extras: LocalAlarmExtras): Alarm {
  return {
    id: backendAlarm.id,
    time: fromBackendTime(backendAlarm.time),
    label: backendAlarm.label ?? "",
    repeatDays: intsToWeekDays(backendAlarm.days_of_week),
    enabled: backendAlarm.is_active,
    createdAt: Date.now(),
    ...extras,
  };
}

function draftToCreatePayload(draft: AlarmDraft): alarmApi.CreateAlarmPayload {
  return {
    time: toBackendTime(draft.time),
    alarm_type: repeatDaysToAlarmType(draft.repeatDays),
    days_of_week: weekDaysToInts(draft.repeatDays),
    label: draft.label,
  };
}

function draftToUpdatePayload(draft: AlarmDraft): alarmApi.UpdateAlarmPayload {
  return {
    ...draftToCreatePayload(draft),
    is_active: draft.enabled,
  };
}

interface AlarmState {
  alarms: Alarm[];
  localExtras: Record<string, LocalAlarmExtras>;
  hasHydrated: boolean;
  isLoading: boolean;
  error: string | null;

  setHasHydrated: (value: boolean) => void;
  fetchAlarms: () => Promise<void>;
  addAlarm: (draft: AlarmDraft) => Promise<Alarm>;
  updateAlarm: (id: string, draft: AlarmDraft) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string, enabled?: boolean) => Promise<void>;
  getAlarmById: (id: string) => Alarm | undefined;
}

export const useAlarmStore = create<AlarmState>()(
  persist(
    (set, get) => ({
      alarms: [],
      localExtras: {},
      hasHydrated: false,
      isLoading: false,
      error: null,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      fetchAlarms: async () => {
        set({ isLoading: true, error: null });
        try {
          const backendAlarms = await alarmApi.listAlarms();
          const { localExtras } = get();
          const alarms = backendAlarms.map((a) => toAlarm(a, localExtras[a.id] ?? DEFAULT_EXTRAS));
          set({ alarms, isLoading: false });
          resyncAllAlarms(alarms).catch(() => {});
        } catch (err) {
          const message = err instanceof ApiError ? err.message : "Couldn't load your alarms.";
          set({ isLoading: false, error: message });
        }
      },

      addAlarm: async (draft) => {
        const created = await alarmApi.createAlarm(draftToCreatePayload(draft));
        const extras: LocalAlarmExtras = {
          sound: draft.sound,
          snoozeEnabled: draft.snoozeEnabled,
          snoozeDurationMinutes: draft.snoozeDurationMinutes,
          vibration: draft.vibration,
        };
        const alarm = toAlarm(created, extras);
        set((state) => ({
          alarms: [alarm, ...state.alarms],
          localExtras: { ...state.localExtras, [alarm.id]: extras },
        }));
        scheduleAlarmNotifications(alarm).catch(() => {});
        return alarm;
      },

      updateAlarm: async (id, draft) => {
        const updated = await alarmApi.updateAlarm(id, draftToUpdatePayload(draft));
        const extras: LocalAlarmExtras = {
          sound: draft.sound,
          snoozeEnabled: draft.snoozeEnabled,
          snoozeDurationMinutes: draft.snoozeDurationMinutes,
          vibration: draft.vibration,
        };
        const alarm = toAlarm(updated, extras);
        set((state) => ({
          alarms: state.alarms.map((a) => (a.id === id ? alarm : a)),
          localExtras: { ...state.localExtras, [id]: extras },
        }));
        scheduleAlarmNotifications(alarm).catch(() => {});
      },

      deleteAlarm: async (id) => {
        // NOTE: the backend's DELETE is a soft delete (sets is_active =
        // false) and GET /alarms/ only returns is_active = true rows — so
        // from the client's point of view this is indistinguishable from
        // disabling the alarm. Removing it from local state here keeps the
        // "Delete" action behaving like a real delete in the UI.
        await alarmApi.deleteAlarm(id);
        await cancelAlarmNotifications(id);
        set((state) => {
          const { [id]: _removed, ...restExtras } = state.localExtras;
          return {
            alarms: state.alarms.filter((a) => a.id !== id),
            localExtras: restExtras,
          };
        });
      },

      toggleAlarm: async (id, enabled) => {
        const current = get().alarms.find((a) => a.id === id);
        if (!current) return;
        const nextEnabled = enabled ?? !current.enabled;
        // Optimistic update so the switch feels instant, corrected if the request fails.
        set((state) => ({
          alarms: state.alarms.map((a) => (a.id === id ? { ...a, enabled: nextEnabled } : a)),
        }));
        try {
          const updated = await alarmApi.updateAlarm(id, { is_active: nextEnabled });
          const updatedAlarm = toAlarm(updated, get().localExtras[id] ?? DEFAULT_EXTRAS);
          set((state) => ({
            alarms: state.alarms.map((a) => (a.id === id ? updatedAlarm : a)),
          }));
          if (nextEnabled) {
            scheduleAlarmNotifications(updatedAlarm).catch(() => {});
          } else {
            cancelAlarmNotifications(id).catch(() => {});
          }
        } catch (err) {
          // Roll back on failure.
          set((state) => ({
            alarms: state.alarms.map((a) => (a.id === id ? { ...a, enabled: current.enabled } : a)),
          }));
          throw err;
        }
      },

      getAlarmById: (id) => get().alarms.find((a) => a.id === id),
    }),
    {
      name: "wakewise-alarms",
      storage: createJSONStorage(() => AsyncStorage),
      // Only the local-only extras need persisting across launches — the
      // alarms themselves are re-fetched from the backend on load.
      partialize: (state) => ({ localExtras: state.localExtras }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);