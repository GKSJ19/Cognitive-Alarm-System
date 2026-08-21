/**
 * alarmScheduler.ts
 * ---------------------------------------------------------------------------
 * Schedules REAL device alarms using Notifee: full-screen intent (rings over
 * the lock screen like a real alarm clock, not just a banner), looping
 * sound until dismissed, and on press/full-screen-launch routes straight
 * into the existing `/alarm-ringing/[id]` screen, which drives the real
 * ring -> challenge -> dismiss flow against the backend.
 *
 * IMPORTANT: Notifee is a native module. It only exists in app installs
 * that were built with it compiled in. On web, or on any older install
 * (e.g. the original EAS build made before Notifee was added), the native
 * module is missing entirely. Importing it directly at the top of this
 * file used to crash the ENTIRE app on startup in that situation --
 * everything below loads Notifee lazily and defensively so that on any
 * build/platform without it, every exported function becomes a harmless
 * no-op instead of crashing app startup.
 * ---------------------------------------------------------------------------
 */
import { Platform } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Alarm } from "@/types/alarm";

const SCHEDULE_MAP_KEY = "wakewise-alarm-notification-ids";
const CHANNEL_ID = "wakewise-alarms-v3";

const WEEKDAY_MS: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

// Lazily require + cache the Notifee module. Never throws -- returns null
// if the native module isn't available in this build/platform.
let _notifeeModule: any = null;
let _notifeeLoadAttempted = false;

function getNotifee(): any | null {
  if (_notifeeLoadAttempted) return _notifeeModule;
  _notifeeLoadAttempted = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("@notifee/react-native");
    _notifeeModule = mod.default ?? mod;
    return _notifeeModule;
  } catch (err) {
    console.log("[alarmScheduler] Notifee native module unavailable -- alarm scheduling disabled on this build.", err instanceof Error ? err.message : String(err));
    return null;
  }
}

export async function ensureNotificationSetup(): Promise<boolean> {
  const notifee = getNotifee();
  if (!notifee) return false;

  try {
    const settings = await notifee.requestPermission();
    const granted = settings.authorizationStatus >= 1;
    console.log("[alarmScheduler] permission settings:", JSON.stringify(settings), "granted:", granted);

    if (Platform.OS === "android") {
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: "Alarms",
        importance: notifee.AndroidImportance?.HIGH ?? 4,
        visibility: notifee.AndroidVisibility?.PUBLIC ?? 1,
        vibration: true,
        vibrationPattern: [300, 500, 300, 500],
        bypassDnd: true,
      });
      console.log("[alarmScheduler] channel created:", CHANNEL_ID);
    }

    return granted;
  } catch (err) {
    console.log("[alarmScheduler] ensureNotificationSetup error:", err instanceof Error ? err.message : String(err));
    return false;
  }
}

async function readScheduleMap(): Promise<Record<string, string[]>> {
  const raw = await AsyncStorage.getItem(SCHEDULE_MAP_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function writeScheduleMap(map: Record<string, string[]>): Promise<void> {
  await AsyncStorage.setItem(SCHEDULE_MAP_KEY, JSON.stringify(map));
}

/** Cancels every scheduled/currently-ringing notification for this alarm id. */
export async function cancelAlarmNotifications(alarmId: string): Promise<void> {
  const notifee = getNotifee();
  const map = await readScheduleMap();
  const ids = map[alarmId] ?? [];
  if (notifee) {
    await Promise.all(ids.map((id) => notifee.cancelNotification(id).catch(() => {})));
  }
  delete map[alarmId];
  await writeScheduleMap(map);
}

/** Stops the currently-ringing alarm (loop sound + full screen) for one alarm id. */
export async function stopRingingAlarm(alarmId: string): Promise<void> {
  const notifee = getNotifee();
  if (!notifee) return;
  const map = await readScheduleMap();
  const ids = map[alarmId] ?? [];
  await Promise.all(ids.map((id) => notifee.cancelNotification(id).catch(() => {})));
}

function nextOccurrence(hour: number, minute: number, weekday?: number): Date {
  const now = new Date();
  const next = new Date();
  next.setSeconds(0, 0);
  next.setHours(hour, minute, 0, 0);

  if (weekday === undefined) {
    if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
    return next;
  }

  let diff = (weekday - next.getDay() + 7) % 7;
  if (diff === 0 && next.getTime() <= now.getTime()) diff = 7;
  next.setDate(next.getDate() + diff);
  return next;
}

/**
 * Schedules (or reschedules) the real device alarm(s) for one alarm.
 * Call this on create, update, and on enable (toggle on).
 * Call cancelAlarmNotifications on delete or toggle off.
 * Silently does nothing if Notifee isn't available on this build/platform.
 */
export async function scheduleAlarmNotifications(alarm: Alarm): Promise<void> {
  const notifee = getNotifee();
  if (!notifee) return;

  try {
    await cancelAlarmNotifications(alarm.id);
    if (!alarm.enabled) {
      console.log("[alarmScheduler] alarm disabled, not scheduling:", alarm.id);
      return;
    }

    const granted = await ensureNotificationSetup();
    if (!granted) {
      console.log("[alarmScheduler] permission NOT granted, aborting schedule for:", alarm.id);
      return;
    }

    const [hourStr, minuteStr] = alarm.time.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    console.log("[alarmScheduler] scheduling alarm", alarm.id, "for", hour, ":", minute, "repeatDays:", alarm.repeatDays);

    const buildTrigger = (date: Date, repeatWeekly: boolean) => ({
      type: notifee.TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      alarmManager: { allowWhileIdle: true },
      ...(repeatWeekly ? { repeatFrequency: notifee.RepeatFrequency.WEEKLY } : {}),
    });

    const scheduledIds: string[] = [];

    const displayFor = async (date: Date, repeatWeekly: boolean) => {
      console.log("[alarmScheduler] creating trigger for date:", date.toString(), "repeatWeekly:", repeatWeekly);
      const id = await notifee.createTriggerNotification(
        {
          title: alarm.label?.trim() ? alarm.label : "Alarm",
          body: "Tap to dismiss with a challenge.",
          data: { alarmId: alarm.id },
          android: {
            channelId: CHANNEL_ID,
            importance: notifee.AndroidImportance?.HIGH ?? 4,
            visibility: notifee.AndroidVisibility?.PUBLIC ?? 1,
            category: "alarm",
            loopSound: true,
            autoCancel: false,
            ongoing: true,
            fullScreenAction: { id: "default" },
            pressAction: { id: "default" },
            timeoutAfter: 1000 * 60 * 10,
          },
        },
        buildTrigger(date, repeatWeekly)
      );
      console.log("[alarmScheduler] createTriggerNotification returned id:", id);
      scheduledIds.push(id);
    };

    if (alarm.repeatDays.length === 0) {
      await displayFor(nextOccurrence(hour, minute), false);
    } else {
      for (const day of alarm.repeatDays) {
        const weekday = WEEKDAY_MS[day];
        if (weekday === undefined) continue;
        await displayFor(nextOccurrence(hour, minute, weekday), true);
      }
    }

    const map = await readScheduleMap();
    map[alarm.id] = scheduledIds;
    await writeScheduleMap(map);
    console.log("[alarmScheduler] scheduled notification IDs for alarm", alarm.id, ":", scheduledIds);
  } catch (err) {
    console.log("[alarmScheduler] !!! ERROR scheduling alarm !!!", alarm.id, err instanceof Error ? err.message : String(err));
  }
}

/** Re-syncs every enabled alarm's schedule. Call once after fetching alarms. */
export async function resyncAllAlarms(alarms: Alarm[]): Promise<void> {
  const notifee = getNotifee();
  if (!notifee) return;
  const granted = await ensureNotificationSetup();
  if (!granted) return;
  for (const alarm of alarms) {
    if (alarm.enabled) {
      await scheduleAlarmNotifications(alarm);
    } else {
      await cancelAlarmNotifications(alarm.id);
    }
  }
}

/**
 * Wires up notification press / full-screen-launch handling so the app
 * navigates to the real ring -> challenge -> dismiss screen. Call once,
 * near app startup (root layout). Safe no-op if Notifee isn't available.
 */
export function registerAlarmNotificationEvents(): void {
  const notifee = getNotifee();
  if (!notifee) return;

  const handleEvent = async (type: any, alarmId: string | undefined) => {
    if (!alarmId) return;
    if (type === notifee.EventType.PRESS || type === notifee.EventType.DELIVERED) {
      router.push(`/alarm-ringing/${alarmId}`);
    }
  };

  notifee.onForegroundEvent(({ type, detail }: any) => {
    handleEvent(type, detail.notification?.data?.alarmId as string | undefined);
  });

  notifee.onBackgroundEvent(async ({ type, detail }: any) => {
    await handleEvent(type, detail.notification?.data?.alarmId as string | undefined);
  });

  notifee.getInitialNotification().then((initial: any) => {
    const alarmId = initial?.notification.data?.alarmId as string | undefined;
    if (alarmId) {
      router.push(`/alarm-ringing/${alarmId}`);
    }
  });
}