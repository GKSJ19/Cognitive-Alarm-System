import type { BackendNotificationType } from "@/services/api/notification.api";

const DISPLAY: Record<string, { title: string; icon: string }> = {
  wake_up_reminder: { title: "Time to wake up", icon: "alarm" },
  challenge_reminder: { title: "Challenge waiting", icon: "puzzle-outline" },
  habit_alert: { title: "Habit score update", icon: "chart-line" },
  progress: { title: "Progress update", icon: "lightbulb-on-outline" },
  platform_announcement: { title: "Announcement", icon: "bullhorn-outline" },
  bedtime_reminder: { title: "Bedtime reminder", icon: "moon-waning-crescent" },
};

const DEFAULT_DISPLAY = { title: "Notification", icon: "bell-outline" };

export function getNotificationDisplay(type: BackendNotificationType) {
  return DISPLAY[type] ?? DEFAULT_DISPLAY;
}

export function formatNotificationTimestamp(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (isToday) return `Today, ${time}`;
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}