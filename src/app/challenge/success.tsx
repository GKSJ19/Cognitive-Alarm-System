import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import AppText from "@/components/common/AppText";
import AppButton from "@/components/buttons/AppButton";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function ChallengeSuccessScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const { alarmId } = useLocalSearchParams<{ alarmId?: string }>();

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: radius.round,
            backgroundColor: colors.success + "22",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.xl,
          }}
        >
          <MaterialCommunityIcons name="check-circle" size={56} color={colors.success} />
        </View>

        <AppText variant="title">You're awake! 🎉</AppText>
        <AppText
          variant="body"
          style={{ color: colors.textSecondary, textAlign: "center", marginTop: spacing.sm }}
        >
          Nice work solving that challenge. Your habit score just got a little better.
        </AppText>

        <View style={{ width: "100%", marginTop: spacing.xxl, gap: spacing.md }}>
          <AppButton title="View Habit Score" onPress={() => router.replace("/habits")} />
          <AppButton
            title="Back to Home"
            variant="outline"
            onPress={() => router.replace("/(app)/home")}
          />
        </View>
      </View>
    </Screen>
  );
}
