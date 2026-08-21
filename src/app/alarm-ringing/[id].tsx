import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import Screen from "@/components/common/Screen";
import AppText from "@/components/common/AppText";
import AppButton from "@/components/buttons/AppButton";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAlarmStore } from "@/store/alarmStore";
import * as verificationApi from "@/services/api/verification.api";
import { ApiError } from "@/services/api/errors";
import { formatTime12h } from "@/utils/date";
import { stopRingingAlarm } from "@/services/notifications/alarmScheduler";

/**
 * Full-screen alarm ringing UI. In a real build this would be triggered by
 * a scheduled local notification / background task; for now it's reachable
 * by navigating to `/alarm-ringing/[id]` (e.g. a "Test Ring" button on the
 * Alarm Details screen) so the whole ring -> challenge -> success flow can
 * be exercised end-to-end without a native alarm scheduler.
 *
 * "Dismiss with Challenge" calls POST /verify/trigger, which is what
 * actually generates the real trigger_id + challenge_id + question on the
 * backend — the challenge screen has nothing to solve without this call.
 */
export default function AlarmRingingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useAppTheme();
  const alarm = useAlarmStore((state) => state.getAlarmById(id));
  const [now, setNow] = useState(new Date());
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  // Stop the looping alarm sound the moment this screen is reached — the
  // user is now awake and looking at it, the OS notification's job is done.
  useEffect(() => {
    if (id) stopRingingAlarm(id).catch(() => {});
  }, [id]);

  const handleDismissWithChallenge = async () => {
    setError(null);
    setIsTriggering(true);
    try {
      const { trigger_id, challenge_id, category, question } = await verificationApi.triggerAlarm(id);
      router.replace({
        pathname: "/challenge/[type]",
        params: { type: category, alarmId: id, triggerId: trigger_id, challengeId: challenge_id, question },
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start the challenge. Please try again.");
      setIsTriggering(false);
    }
  };

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

        {error && (
          <AppText style={{ color: "#FFFFFF", opacity: 0.9, marginTop: spacing.md, textAlign: "center" }}>
            {error}
          </AppText>
        )}

        <View style={{ width: "100%", marginTop: spacing.xxxl, gap: spacing.md }}>
          <AppButton
            title="Dismiss with Challenge"
            onPress={handleDismissWithChallenge}
            loading={isTriggering}
          />

          {alarm?.snoozeEnabled && (
            <AppButton
              title={`Snooze ${alarm.snoozeDurationMinutes}m`}
              variant="outline"
              onPress={() => router.replace({ pathname: "/challenge/snooze", params: { alarmId: id } })}
              disabled={isTriggering}
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
