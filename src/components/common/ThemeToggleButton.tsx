import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAppTheme } from "@/hooks/useAppTheme";

interface Props {
  style?: ViewStyle;
}

/**
 * Small floating icon button that flips Dark Mode on/off.
 * Drop it into any screen that doesn't have a Header (e.g. auth screens),
 * usually positioned top-right with `style={{ position: "absolute", top, right }}`.
 */
export default function ThemeToggleButton({ style }: Props) {
  const { darkMode, toggleDarkMode, colors } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={toggleDarkMode}
      activeOpacity={0.75}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      style={[
        styles.button,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name={darkMode ? "white-balance-sunny" : "moon-waning-crescent"}
        size={20}
        color={darkMode ? "#F59E0B" : colors.primary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
