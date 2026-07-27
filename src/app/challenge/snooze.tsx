import { useEffect, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import AppText from "@/components/common/AppText";
import AppButton from "@/components/buttons/AppButton";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAlarmStore } from "@/store/alarmStore";

export default function ChallengeSnoozeScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const { alarmId } = useLocalSearchParams<{ alarmId?: string }>();
  const alarm = useAlarmStore((state) => (alarmId ? state.getAlarmById(alarmId) : undefined));
  const minutes = alarm?.snoozeDurationMinutes ?? 10;

  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0 && alarmId) {
      router.replace(`/alarm-ringing/${alarmId}`);
    }
  }, [secondsLeft, alarmId]);

  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl }}>
        <MaterialCommunityIcons name="sleep" size={56} color={colors.primary} />

        <AppText variant="title" style={{ marginTop: spacing.lg }}>
          Snoozing
        </AppText>
        <AppText variant="body" style={{ color: colors.textSecondary, marginTop: spacing.xs }}>
          The alarm will ring again in
        </AppText>

        <AppText variant="title" style={{ fontSize: 48, marginTop: spacing.lg, color: colors.primary }}>
          {mm}:{ss}
        </AppText>

        <View style={{ width: "100%", marginTop: spacing.xxl }}>
          <AppButton
            title="Ring Now Instead"
            variant="outline"
            onPress={() => alarmId && router.replace(`/alarm-ringing/${alarmId}`)}
          />
        </View>
      </View>
    </Screen>
  );
}
