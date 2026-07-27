import { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import AppText from "@/components/common/AppText";
import AppButton from "@/components/buttons/AppButton";
import Card from "@/components/cards/Card";
import TimePickerField from "@/components/alarms/TimePickerField";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useSettingsStore } from "@/store/settingsStore";

const GOAL_TYPES = ["Better Sleep", "Consistent Routine", "Productivity", "Fitness"];
const DIFFICULTIES = ["Easy", "Medium", "Hard", "Extreme"];
const TIMEZONES = ["GMT+05:30 (India)", "GMT+00:00 (UTC)", "GMT-05:00 (US Eastern)", "GMT+01:00 (CET)"];

const STEPS = ["Wake Time", "Sleep Duration", "Timezone", "Goal", "Difficulty"] as const;

/**
 * First-run wizard. Reached from Register (see src/app/auth/register.tsx)
 * before landing on Home, or later from Profile > Edit Profile.
 * Selections are stored in settingsStore so the rest of the app (Habit
 * Score, Recommendations, Challenge difficulty) can read them once those
 * features are backed by a real API.
 */
export default function ProfileSetupWizard() {
  const { colors, spacing, radius } = useAppTheme();
  const setProfilePrefs = useSettingsStore((state) => state.setProfilePrefs);

  const [step, setStep] = useState(0);
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepDuration, setSleepDuration] = useState(8);
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [goal, setGoal] = useState(GOAL_TYPES[0]);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]);

  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setProfilePrefs({ wakeTime, sleepDuration, timezone, goal, difficulty });
      router.replace("/(app)/home");
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <Screen>
      <View style={{ flex: 1, padding: spacing.lg }}>
        <View style={{ flexDirection: "row", gap: 6, marginBottom: spacing.xl }}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: radius.round,
                backgroundColor: i <= step ? colors.primary : colors.border,
              }}
            />
          ))}
        </View>

        <AppText variant="caption" style={{ color: colors.primary, fontWeight: "700" }}>
          STEP {step + 1} OF {STEPS.length}
        </AppText>
        <AppText variant="title" style={{ marginTop: spacing.xs, marginBottom: spacing.lg }}>
          {STEPS[step]}
        </AppText>

        <Card style={{ flex: 1 }}>
          {step === 0 && (
            <View>
              <AppText variant="body" style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
                What time do you want to wake up on a typical day?
              </AppText>
              <TimePickerField value={wakeTime} onChange={setWakeTime} />
            </View>
          )}

          {step === 1 && (
            <View>
              <AppText variant="body" style={{ color: colors.textSecondary, marginBottom: spacing.lg }}>
                How many hours do you want to sleep?
              </AppText>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xl }}>
                <TouchableOpacity onPress={() => setSleepDuration((d) => Math.max(4, d - 0.5))}>
                  <MaterialIconCircle icon="minus" />
                </TouchableOpacity>
                <AppText variant="title">{sleepDuration}h</AppText>
                <TouchableOpacity onPress={() => setSleepDuration((d) => Math.min(12, d + 0.5))}>
                  <MaterialIconCircle icon="plus" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 2 && (
            <SelectableList options={TIMEZONES} value={timezone} onChange={setTimezone} />
          )}

          {step === 3 && <SelectableList options={GOAL_TYPES} value={goal} onChange={setGoal} />}

          {step === 4 && (
            <SelectableList options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
          )}
        </Card>

        <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.lg }}>
          {step > 0 && (
            <View style={{ flex: 1 }}>
              <AppButton title="Back" variant="outline" onPress={() => setStep((s) => s - 1)} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <AppButton title={isLast ? "Finish" : "Next"} onPress={handleNext} />
          </View>
        </View>
      </View>
    </Screen>
  );
}

function SelectableList({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const { colors, spacing, radius } = useAppTheme();
  return (
    <View>
      {options.map((option) => {
        const active = option === value;
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onChange(option)}
            style={[
              styles.row,
              {
                borderRadius: radius.md,
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primary + "1A" : "transparent",
                marginBottom: spacing.sm,
              },
            ]}
          >
            <AppText variant="body" style={{ color: active ? colors.primary : colors.text }}>
              {option}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MaterialIconCircle({ icon }: { icon: "plus" | "minus" }) {
  const { colors, radius } = useAppTheme();
  return (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: radius.round,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MaterialCommunityIcons name={icon} size={22} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
});
