import { useState } from "react";
import { View, ScrollView, Switch, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppText from "@/components/common/AppText";
import AppInput from "@/components/forms/AppInput";
import AppButton from "@/components/buttons/AppButton";
import Card from "@/components/cards/Card";
import TimePickerField from "@/components/alarms/TimePickerField";
import DayRepeatSelector from "@/components/alarms/DayRepeatSelector";

import { AlarmDraft, ALARM_SOUNDS, WeekDay } from "@/types/alarm";
import { useAppTheme } from "@/hooks/useAppTheme";

interface AlarmFormProps {
  initialValue: AlarmDraft;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (draft: AlarmDraft) => void;
}

export default function AlarmForm({
  initialValue,
  submitLabel,
  submitting = false,
  onSubmit,
}: AlarmFormProps) {
  const { colors, spacing } = useAppTheme();

  const [time, setTime] = useState(initialValue.time);
  const [label, setLabel] = useState(initialValue.label);
  const [repeatDays, setRepeatDays] = useState<WeekDay[]>(initialValue.repeatDays);
  const [sound, setSound] = useState(initialValue.sound);
  const [snoozeEnabled, setSnoozeEnabled] = useState(initialValue.snoozeEnabled);
  const [vibration, setVibration] = useState(initialValue.vibration);
  const [labelError, setLabelError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!label.trim()) {
      setLabelError("Give this alarm a label");
      return;
    }
    setLabelError(null);

    onSubmit({
      time,
      label: label.trim(),
      repeatDays,
      enabled: initialValue.enabled,
      sound,
      snoozeEnabled,
      snoozeDurationMinutes: initialValue.snoozeDurationMinutes,
      vibration,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: spacing.xxxl }}
      showsVerticalScrollIndicator={false}
    >
      <Card style={{ marginBottom: spacing.lg }}>
        <TimePickerField value={time} onChange={setTime} />
      </Card>

      <View style={{ marginBottom: spacing.lg }}>
        <AppInput
          placeholder="Label (e.g. Morning Workout)"
          value={label}
          onChangeText={setLabel}
        />
        {labelError && (
          <AppText variant="caption" style={{ color: colors.error, marginTop: 4 }}>
            {labelError}
          </AppText>
        )}
      </View>

      <Card style={{ marginBottom: spacing.lg }}>
        <AppText variant="body" style={{ marginBottom: spacing.md }}>
          Repeat
        </AppText>
        <DayRepeatSelector selectedDays={repeatDays} onChange={setRepeatDays} />
      </Card>

      <Card style={{ marginBottom: spacing.lg }}>
        <AppText variant="body" style={{ marginBottom: spacing.md }}>
          Alarm Sound
        </AppText>
        {ALARM_SOUNDS.map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.soundRow}
            onPress={() => setSound(option)}
            activeOpacity={0.7}
          >
            <AppText variant="body">{option}</AppText>
            {sound === option && (
              <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </Card>

      <Card style={{ marginBottom: spacing.xl }}>
        <View style={styles.switchRow}>
          <AppText variant="body">Snooze</AppText>
          <Switch
            value={snoozeEnabled}
            onValueChange={setSnoozeEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.switchRow, { marginTop: spacing.md }]}>
          <AppText variant="body">Vibration</AppText>
          <Switch
            value={vibration}
            onValueChange={setVibration}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </Card>

      <AppButton title={submitLabel} onPress={handleSubmit} loading={submitting} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  soundRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
