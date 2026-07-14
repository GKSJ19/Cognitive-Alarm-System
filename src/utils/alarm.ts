import { Alarm, WeekDay, WEEK_DAYS } from "@/types/alarm";
import { formatRemainingTime } from "@/utils/date";

/** Returns the enabled alarm that will ring soonest from `now`. */
export function getNextAlarm(alarms: Alarm[], now: Date = new Date()): Alarm | null {
  const enabled = alarms.filter((a) => a.enabled);
  if (enabled.length === 0) return null;

  let soonest: Alarm | null = null;
  let soonestMs = Infinity;

  for (const alarm of enabled) {
    const [hour, minute] = alarm.time.split(":").map(Number);
    const target = new Date(now);
    target.setHours(hour, minute, 0, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    const ms = target.getTime() - now.getTime();
    if (ms < soonestMs) {
      soonestMs = ms;
      soonest = alarm;
    }
  }

  return soonest;
}

export function getRemainingTimeLabel(alarm: Alarm | null): string {
  if (!alarm) return "No alarms set";
  return formatRemainingTime(alarm.time);
}

/** "Mon, Wed, Fri" / "Every day" / "One time" */
export function formatRepeatDays(days: WeekDay[]): string {
  if (days.length === 0) return "One time";
  if (days.length === 7) return "Every day";

  const isWeekdays =
    days.length === 5 &&
    ["Mon", "Tue", "Wed", "Thu", "Fri"].every((d) => days.includes(d as WeekDay));
  if (isWeekdays) return "Weekdays";

  const isWeekend =
    days.length === 2 && ["Sat", "Sun"].every((d) => days.includes(d as WeekDay));
  if (isWeekend) return "Weekends";

  return WEEK_DAYS.filter((d) => days.includes(d)).join(", ");
}
