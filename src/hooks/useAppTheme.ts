import { LightTheme, DarkTheme, Spacing, Radius, Shadows, Typography } from "@/theme";
import { useSettingsStore } from "@/store/settingsStore";

/**
 * Central place every new screen/component reads colors from, so Dark Mode
 * (Profile > Dark Mode Toggle) affects the whole app consistently.
 *
 * Uses LightTheme/DarkTheme (theme/lightTheme.ts, theme/darkTheme.ts) rather
 * than the raw Colors.light/Colors.dark objects, because those two already
 * flatten background/surface/text/border/card together with
 * primary/secondary/success/warning/error into the single shape every
 * component here reads from (colors.primary, colors.success, etc).
 *
 * Defaults to LightTheme, which reuses the exact same values Screen/AppText
 * already hardcoded before this hook existed — so nothing changes visually
 * until a user actually turns Dark Mode on.
 */
export function useAppTheme() {
  const darkMode = useSettingsStore((state) => state.darkMode);
  const toggleDarkMode = useSettingsStore((state) => state.toggleDarkMode);

  const colors = darkMode ? DarkTheme.colors : LightTheme.colors;

  return {
    darkMode,
    toggleDarkMode,
    colors,
    spacing: Spacing,
    radius: Radius,
    shadows: Shadows,
    typography: Typography,
  };
}
