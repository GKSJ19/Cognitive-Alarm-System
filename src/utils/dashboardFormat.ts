export function minuteOfDayToClock(minutes: number | null): string {
  if (minutes == null) return "–";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + ", " + date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}