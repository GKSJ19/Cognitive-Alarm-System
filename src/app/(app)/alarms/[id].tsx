import { View, Alert, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";
import AppButton from "@/components/buttons/AppButton";
import EmptyState from "@/components/common/EmptyState";

import { useAlarmStore } from "@/store/alarmStore";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatTime12h } from "@/utils/date";
import { formatRepeatDays } from "@/utils/alarm";

export default function AlarmDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useAppTheme();

  const alarm = useAlarmStore((state) => state.getAlarmById(id));
  const deleteAlarm = useAlarmStore((state) => state.deleteAlarm);
  const toggleAlarm = useAlarmStore((state) => state.toggleAlarm);

  if (!alarm) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="Alarm not found"
          description="It may have already been deleted."
          actionLabel="Back to Alarms"
          onActionPress={() => router.replace("/(app)/alarms")}
        />
      </Screen>
    );
  }

  const handleDelete = () => {
    Alert.alert("Delete alarm?", `"${alarm.label}" will be permanently removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteAlarm(alarm.id);
          router.replace("/(app)/alarms");
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Alarm Details" />

        <Card style={{ marginBottom: spacing.lg, alignItems: "center" }}>
          <AppText variant="title" style={{ fontSize: 44 }}>
            {formatTime12h(alarm.time)}
          </AppText>
          <AppText variant="body" style={{ color: colors.textSecondary, marginTop: spacing.xs }}>
            {alarm.label}
          </AppText>
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <DetailRow label="Repeat" value={formatRepeatDays(alarm.repeatDays)} />
          <DetailRow label="Sound" value={alarm.sound} />
          <DetailRow label="Snooze" value={alarm.snoozeEnabled ? "On" : "Off"} />
          <DetailRow label="Vibration" value={alarm.vibration ? "On" : "Off"} last />
        </Card>

        <View style={{ gap: spacing.md }}>
          <AppButton
            title={alarm.enabled ? "Disable Alarm" : "Enable Alarm"}
            variant="outline"
            onPress={() => toggleAlarm(alarm.id)}
          />
          <AppButton
            title="Edit Alarm"
            onPress={() => router.push(`/(app)/alarms/edit/${alarm.id}`)}
          />
          <AppButton title="Delete Alarm" variant="outline" onPress={handleDelete} />
        </View>
      </View>
    </Screen>
  );
}

function DetailRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  const { colors, spacing } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: spacing.sm,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <AppText variant="body" style={{ color: colors.textSecondary }}>
        {label}
      </AppText>
      <AppText variant="body">{value}</AppText>
    </View>
  );
}
