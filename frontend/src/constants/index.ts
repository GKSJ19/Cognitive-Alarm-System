/** Application-wide constants */

export const APP_NAME = "ICAP";
export const APP_FULL_NAME = "Intelligent Cognitive Alarm Platform";

/** API configuration */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

/** Local storage keys */
export const STORAGE_KEYS = {
  TOKEN: "icap_token",
  THEME: "icap_theme",
} as const;

/** Navigation items for the sidebar */
export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", iconName: "LayoutDashboard" },
  { to: "/alarms", label: "Alarms", iconName: "Bell" },
  { to: "/habits", label: "Habits", iconName: "Target" },
  { to: "/challenges", label: "Challenges", iconName: "Brain" },
  { to: "/reports", label: "Reports", iconName: "BarChart3" },
  { to: "/settings", label: "Settings", iconName: "Settings" },
] as const;

/** Role names */
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  COACH: "coach",
} as const;
