/** Mock data for the three role-based analytics dashboards. */
export const USER_DASHBOARD = {
  alarmHistory: [
    { label: "Mon", value: 1 },
    { label: "Tue", value: 1 },
    { label: "Wed", value: 2 },
    { label: "Thu", value: 1 },
    { label: "Fri", value: 1 },
    { label: "Sat", value: 0 },
    { label: "Sun", value: 1 },
  ],
  wakeUpStats: { onTimeRate: 86, avgSnoozeCount: 0.6, avgTimeToDismiss: "42s" },
  challengePerformance: [
    { label: "Math", value: 95 },
    { label: "Logic", value: 81 },
    { label: "Word", value: 74 },
    { label: "Quiz", value: 88 },
  ],
  productivityInsights: [
    "Deep work sessions are 23% longer on days you wake before 7 AM.",
    "Your focus score dips on days with 2+ snoozes.",
  ],
};

export const COACH_DASHBOARD = {
  assignedUsers: [
    { id: "u1", name: "Aarav Mehta", habitScore: 82, trend: "up" as const },
    { id: "u2", name: "Priya Nair", habitScore: 64, trend: "down" as const },
    { id: "u3", name: "Rohan Gupta", habitScore: 91, trend: "up" as const },
    { id: "u4", name: "Sana Iyer", habitScore: 58, trend: "flat" as const },
  ],
  sleepTrends: [
    { label: "W1", value: 7.1 },
    { label: "W2", value: 7.4 },
    { label: "W3", value: 6.9 },
    { label: "W4", value: 7.6 },
  ],
  habitAnalytics: { avgHabitScore: 74, atRiskUsers: 2, improvingUsers: 6 },
};

export const ADMIN_DASHBOARD = {
  userManagement: { totalUsers: 4820, activeToday: 1276, newThisWeek: 143 },
  platformAnalytics: [
    { label: "Mon", value: 980 },
    { label: "Tue", value: 1120 },
    { label: "Wed", value: 1005 },
    { label: "Thu", value: 1250 },
    { label: "Fri", value: 1190 },
    { label: "Sat", value: 860 },
    { label: "Sun", value: 790 },
  ],
  systemStats: { uptime: "99.98%", avgResponseTime: "128ms", errorRate: "0.03%" },
};
