import { ReactNode } from "react";
import { View, StyleSheet } from "react-native";

import Screen from "@/components/common/Screen";
import AppText from "@/components/common/AppText";
import Card from "@/components/cards/Card";
import { useAppTheme } from "@/hooks/useAppTheme";

interface ChallengeShellProps {
  title: string;
  instructions: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Shared full-screen frame every wake-up challenge screen is built on. */
export default function ChallengeShell({ title, instructions, children, footer }: ChallengeShellProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: spacing.lg, justifyContent: "space-between" }}>
        <View>
          <AppText variant="caption" style={{ color: colors.primary, fontWeight: "700" }}>
            WAKE-UP CHALLENGE
          </AppText>
          <AppText variant="title" style={{ marginTop: spacing.xs }}>
            {title}
          </AppText>
          <AppText variant="body" style={{ color: colors.textSecondary, marginTop: spacing.xs }}>
            {instructions}
          </AppText>

          <Card style={{ marginTop: spacing.xl }}>{children}</Card>
        </View>

        {footer && <View style={{ marginTop: spacing.lg }}>{footer}</View>}
      </View>
    </Screen>
  );
}

export const optionStyles = StyleSheet.create({
  option: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
});
