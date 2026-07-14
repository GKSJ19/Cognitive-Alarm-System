import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppText from "@/components/common/AppText";
import { formatTime12h } from "@/utils/date";
import { useAppTheme } from "@/hooks/useAppTheme";

interface TimePickerFieldProps {
  /** 24h "HH:mm" */
  value: string;
  onChange: (value: string) => void;
}

/**
 * A dependency-free time picker: large digital readout plus +/- steppers for
 * hour and minute. Avoids pulling in a native date-time-picker package the
 * project may not have installed yet.
 */
export default function TimePickerField({ value, onChange }: TimePickerFieldProps) {
  const { colors, radius, spacing } = useAppTheme();
  const [hour, minute] = value.split(":").map(Number);

  const setTime = (nextHour: number, nextMinute: number) => {
    const h = ((nextHour % 24) + 24) % 24;
    const m = ((nextMinute % 60) + 60) % 60;
    onChange(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  };

  return (
    <View style={{ alignItems: "center" }}>
      <AppText variant="title" style={{ fontSize: 40, marginBottom: spacing.md }}>
        {formatTime12h(value)}
      </AppText>

      <View style={styles.row}>
        <Stepper
          label="Hour"
          onIncrement={() => setTime(hour + 1, minute)}
          onDecrement={() => setTime(hour - 1, minute)}
        />
        <View style={{ width: spacing.xl }} />
        <Stepper
          label="Minute"
          onIncrement={() => setTime(hour, minute + 1)}
          onDecrement={() => setTime(hour, minute - 1)}
        />
      </View>
    </View>
  );

  function Stepper({
    label,
    onIncrement,
    onDecrement,
  }: {
    label: string;
    onIncrement: () => void;
    onDecrement: () => void;
  }) {
    return (
      <View style={{ alignItems: "center" }}>
        <TouchableOpacity
          onPress={onIncrement}
          style={[styles.stepButton, { borderRadius: radius.md, backgroundColor: colors.card }]}
          accessibilityLabel={`Increase ${label}`}
        >
          <MaterialCommunityIcons name="chevron-up" size={22} color={colors.primary} />
        </TouchableOpacity>

        <AppText variant="caption" style={{ color: colors.textSecondary, marginVertical: 4 }}>
          {label}
        </AppText>

        <TouchableOpacity
          onPress={onDecrement}
          style={[styles.stepButton, { borderRadius: radius.md, backgroundColor: colors.card }]}
          accessibilityLabel={`Decrease ${label}`}
        >
          <MaterialCommunityIcons name="chevron-down" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  stepButton: {
    width: 48,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
