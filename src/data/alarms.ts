import { Alarm } from "@/types/alarm";

/**
 * Dummy seed data for the Alarm module. There is no backend yet — this only
 * seeds the persisted alarmStore the first time the app runs on a device.
 */
export const DUMMY_ALARMS: Alarm[] = [
  {
    id: "alarm-1",
    time: "06:30",
    label: "Morning Workout",
    repeatDays: ["Mon", "Wed", "Fri"],
    enabled: true,
    sound: "Morning Birds",
    snoozeEnabled: true,
    snoozeDurationMinutes: 10,
    vibration: true,
    createdAt: Date.now() - 86_400_000 * 6,
  },
  {
    id: "alarm-2",
    time: "07:30",
    label: "Work",
    repeatDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    enabled: true,
    sound: "Classic Chime",
    snoozeEnabled: true,
    snoozeDurationMinutes: 5,
    vibration: true,
    createdAt: Date.now() - 86_400_000 * 5,
  },
  {
    id: "alarm-3",
    time: "09:00",
    label: "Weekend Lie-in",
    repeatDays: ["Sat", "Sun"],
    enabled: false,
    sound: "Gentle Piano",
    snoozeEnabled: false,
    snoozeDurationMinutes: 10,
    vibration: false,
    createdAt: Date.now() - 86_400_000 * 3,
  },
  {
    id: "alarm-4",
    time: "13:00",
    label: "Power Nap",
    repeatDays: [],
    enabled: true,
    sound: "Digital Beep",
    snoozeEnabled: false,
    snoozeDurationMinutes: 5,
    vibration: true,
    createdAt: Date.now() - 86_400_000,
  },
];
