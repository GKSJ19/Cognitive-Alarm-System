import { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import AlarmForm from "@/components/alarms/AlarmForm";
import EmptyState from "@/components/common/EmptyState";

import { useAlarmStore } from "@/store/alarmStore";
import { useAppTheme } from "@/hooks/useAppTheme";
import { AlarmDraft } from "@/types/alarm";

export default function EditAlarmScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useAppTheme();

  const alarm = useAlarmStore((state) => state.getAlarmById(id));
  const updateAlarm = useAlarmStore((state) => state.updateAlarm);
  const [submitting, setSubmitting] = useState(false);

  if (!alarm) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="Alarm not found"
          actionLabel="Back to Alarms"
          onActionPress={() => router.replace("/(app)/alarms")}
        />
      </Screen>
    );
  }

  const handleSubmit = (draft: AlarmDraft) => {
    setSubmitting(true);
    updateAlarm(alarm.id, draft);
    setSubmitting(false);
    router.replace(`/(app)/alarms/${alarm.id}`);
  };

  return (
    <Screen>
      <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Edit Alarm" />

        <AlarmForm
          initialValue={alarm}
          submitLabel="Save Changes"
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      </View>
    </Screen>
  );
}
