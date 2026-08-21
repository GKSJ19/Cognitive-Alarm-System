export interface Recommendation {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "sleep" | "productivity" | "habit";
}

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec-1",
    title: "Shift bedtime 15 minutes earlier",
    description: "Your average sleep this week is under your 8h goal. A small shift tonight can close most of the gap.",
    icon: "weather-night",
    category: "sleep",
  },
  {
    id: "rec-2",
    title: "Try a Logic Challenge tomorrow",
    description: "Math Challenges have a 95% completion rate for you — a Logic Challenge could sharpen focus further.",
    icon: "puzzle-outline",
    category: "habit",
  },
  {
    id: "rec-3",
    title: "Block your first hour for deep work",
    description: "Your productivity score peaks between 8-10 AM. Protect that window from meetings today.",
    icon: "chart-timeline-variant",
    category: "productivity",
  },
  {
    id: "rec-4",
    title: "Keep your streak alive",
    description: "You're 2 days away from beating your best streak of 27 days. Don't snooze tomorrow!",
    icon: "fire",
    category: "habit",
  },
];
