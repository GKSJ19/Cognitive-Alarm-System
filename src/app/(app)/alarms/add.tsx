import { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import AlarmForm from "@/components/alarms/AlarmForm";

import { useAlarmStore } from "@/store/alarmStore";
import { useAppTheme } from "@/hooks/useAppTheme";
import { AlarmDraft } from "@/types/alarm";

const DEFAULT_DRAFT: AlarmDraft = {
  time: "07:00",
  label: "",
  repeatDays: [],
  enabled: true,
  sound: "Classic Chime",
  snoozeEnabled: true,
  snoozeDurationMinutes: 10,
  vibration: true,
};

export default function AddAlarmScreen() {
  const { colors, spacing } = useAppTheme();
  const addAlarm = useAlarmStore((state) => state.addAlarm);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (draft: AlarmDraft) => {
    setSubmitting(true);
    addAlarm(draft);
    setSubmitting(false);
    router.back();
  };

  return (
    <Screen>
      <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Add Alarm" />

        <AlarmForm
          initialValue={DEFAULT_DRAFT}
          submitLabel="Save Alarm"
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      </View>
    </Screen>
  );
}
