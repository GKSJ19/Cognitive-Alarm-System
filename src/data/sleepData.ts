import { SleepSummary } from "@/types/sleep";

/**
 * Dummy analytics data. No backend yet — Analytics screen and the Dashboard's
 * "Today's Sleep" card both read from this until a real sleep-tracking
 * integration exists.
 */
export const DUMMY_SLEEP_SUMMARY: SleepSummary = {
  averageHours: 7.2,
  averageQuality: 82,
  sleepScore: 78,
  weekly: [
    { day: "Mon", date: "2026-07-06", hours: 6.8, quality: 74 },
    { day: "Tue", date: "2026-07-07", hours: 7.5, quality: 85 },
    { day: "Wed", date: "2026-07-08", hours: 6.2, quality: 68 },
    { day: "Thu", date: "2026-07-09", hours: 7.9, quality: 90 },
    { day: "Fri", date: "2026-07-10", hours: 6.5, quality: 72 },
    { day: "Sat", date: "2026-07-11", hours: 8.4, quality: 93 },
    { day: "Sun", date: "2026-07-12", hours: 7.1, quality: 80 },
  ],
  monthly: [
    { week: "Week 1", hours: 7.0 },
    { week: "Week 2", hours: 7.4 },
    { week: "Week 3", hours: 6.8 },
    { week: "Week 4", hours: 7.6 },
  ],
};

export const AI_SUGGESTIONS = [
  "You slept 40 minutes less than usual this week — try winding down 20 minutes earlier tonight.",
  "Your best sleep quality was on Saturday. Keeping a consistent wake time helped.",
  "Wednesday's short sleep may affect focus today. Consider a short afternoon walk instead of caffeine.",
];
