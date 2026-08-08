import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import AppText from "@/components/common/AppText";
import AppButton from "@/components/buttons/AppButton";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function ChallengeFailureScreen() {
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
            backgroundColor: colors.error + "22",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.xl,
          }}
        >
          <MaterialCommunityIcons name="close-circle" size={56} color={colors.error} />
        </View>

        <AppText variant="title">Not quite</AppText>
        <AppText
          variant="body"
          style={{ color: colors.textSecondary, textAlign: "center", marginTop: spacing.sm }}
        >
          That wasn't the right answer. Give it another shot to fully dismiss the alarm.
        </AppText>

        <View style={{ width: "100%", marginTop: spacing.xxl, gap: spacing.md }}>
          <AppButton
            title="Try Again"
            onPress={() => router.replace(alarmId ? `/alarm-ringing/${alarmId}` : "/(app)/alarms")}
          />
          <AppButton
            title="Snooze Instead"
            variant="outline"
            onPress={() => router.replace({ pathname: "/challenge/snooze", params: { alarmId: alarmId ?? "" } })}
          />
        </View>
      </View>
    </Screen>
  );
}
