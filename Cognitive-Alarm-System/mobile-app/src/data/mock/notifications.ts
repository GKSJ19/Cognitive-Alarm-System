export interface AppNotification {
  id: string;
  title: string;
  body: string;
  icon: string;
  timestamp: string;
  read: boolean;
}

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", title: "Streak milestone!", body: "You've hit a 12-day wake-up streak. Keep it going.", icon: "fire", timestamp: "Today, 7:32 AM", read: false },
  { id: "n2", title: "New recommendation", body: "We suggested shifting your bedtime 15 minutes earlier.", icon: "lightbulb-on-outline", timestamp: "Today, 8:00 AM", read: false },
  { id: "n3", title: "Weekly report ready", body: "Your sleep & productivity report for last week is ready to view.", icon: "file-chart-outline", timestamp: "Yesterday", read: true },
  { id: "n4", title: "Alarm updated", body: "\"Weekend Lie-in\" was updated successfully.", icon: "alarm", timestamp: "2 days ago", read: true },
];
