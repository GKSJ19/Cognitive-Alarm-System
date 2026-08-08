import { View, StyleSheet, TouchableOpacity } from "react-native";

import AppText from "./AppText";
import { useAppTheme } from "@/hooks/useAppTheme";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export default function SectionHeader({
  title,
  actionLabel,
  onActionPress,
}: SectionHeaderProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <View style={[styles.container, { marginBottom: spacing.sm }]}>
      <AppText variant="subtitle">{title}</AppText>

      {actionLabel && onActionPress && (
        <TouchableOpacity onPress={onActionPress} hitSlop={8}>
          <AppText variant="caption" style={{ color: colors.primary, fontWeight: "700" }}>
            {actionLabel}
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
