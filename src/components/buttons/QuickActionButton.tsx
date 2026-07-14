import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppText from "@/components/common/AppText";
import { useAppTheme } from "@/hooks/useAppTheme";

interface QuickActionButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
}

export default function QuickActionButton({ icon, label, onPress }: QuickActionButtonProps) {
  const { colors, radius, shadows, spacing } = useAppTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          padding: spacing.md,
        },
        shadows.small,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
      <AppText variant="caption" style={{ marginTop: spacing.xs, textAlign: "center" }}>
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 84,
  },
});
