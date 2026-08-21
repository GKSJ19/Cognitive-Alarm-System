import { View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppText from "./AppText";
import AppButton from "@/components/buttons/AppButton";
import { useAppTheme } from "@/hooks/useAppTheme";

interface EmptyStateProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onActionPress,
}: EmptyStateProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <View style={[styles.container, { paddingVertical: spacing.xxxl }]}>
      <MaterialCommunityIcons name={icon} size={48} color={colors.textSecondary} />

      <AppText variant="subtitle" style={{ marginTop: spacing.md, textAlign: "center" }}>
        {title}
      </AppText>

      {description && (
        <AppText
          variant="body"
          style={{
            color: colors.textSecondary,
            textAlign: "center",
            marginTop: spacing.xs,
          }}
        >
          {description}
        </AppText>
      )}

      {actionLabel && onActionPress && (
        <View style={{ marginTop: spacing.lg, width: "60%" }}>
          <AppButton title={actionLabel} onPress={onActionPress} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
});
