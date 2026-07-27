import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import AppText from "@/components/common/AppText";
import AppButton from "@/components/buttons/AppButton";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAlarmStore } from "@/store/alarmStore";
import { CHALLENGE_CATALOG } from "@/types/challenge";
import { formatTime12h } from "@/utils/date";

/**
 * Full-screen alarm ringing UI. In a real build this would be triggered by
 * a scheduled local notification / background task; for now it's reachable
 * by navigating to `/alarm-ringing/[id]` (e.g. a "Test Ring" button on the
 * Alarm Details screen) so the whole ring -> challenge -> success flow can
 * be exercised end-to-end without a native alarm scheduler.
 */
export default function AlarmRingingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius } = useAppTheme();
  const alarm = useAlarmStore((state) => state.getAlarmById(id));
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const challengeType = CHALLENGE_CATALOG[Math.floor(Math.random() * CHALLENGE_CATALOG.length) % CHALLENGE_CATALOG.length].type;

  return (
    <Screen style={{ backgroundColor: colors.primary }}>
      <View style={styles.container}>
        <AppText variant="caption" style={{ color: "#FFFFFF", opacity: 0.8 }}>
          {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </AppText>

        <AppText variant="title" style={{ color: "#FFFFFF", fontSize: 64, marginTop: spacing.sm }}>
          {alarm ? formatTime12h(alarm.time) : "--:--"}
        </AppText>

        <AppText variant="subtitle" style={{ color: "#FFFFFF", marginTop: spacing.sm, textAlign: "center" }}>
          {alarm?.label ?? "Alarm"}
        </AppText>

        <View style={{ width: "100%", marginTop: spacing.xxxl, gap: spacing.md }}>
          <AppButton
            title="Dismiss with Challenge"
            onPress={() =>
              router.replace({
                pathname: `/challenge/${challengeType}`,
                params: { alarmId: id },
              })
            }
          />

          {alarm?.snoozeEnabled && (
            <AppButton
              title={`Snooze ${alarm.snoozeDurationMinutes}m`}
              variant="outline"
              onPress={() => router.replace({ pathname: "/challenge/snooze", params: { alarmId: id } })}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
