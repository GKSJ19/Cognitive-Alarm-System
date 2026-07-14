import { View, TouchableOpacity, StyleSheet } from "react-native";

import AppText from "@/components/common/AppText";
import { WeekDay, WEEK_DAYS } from "@/types/alarm";
import { useAppTheme } from "@/hooks/useAppTheme";

interface DayRepeatSelectorProps {
  selectedDays: WeekDay[];
  onChange: (days: WeekDay[]) => void;
}

export default function DayRepeatSelector({ selectedDays, onChange }: DayRepeatSelectorProps) {
  const { colors, radius } = useAppTheme();

  const toggleDay = (day: WeekDay) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day]);
    }
  };

  return (
    <View style={styles.row}>
      {WEEK_DAYS.map((day) => {
        const selected = selectedDays.includes(day);
        return (
          <TouchableOpacity
            key={day}
            onPress={() => toggleDay(day)}
            style={[
              styles.chip,
              {
                borderRadius: radius.round,
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? colors.primary : "transparent",
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <AppText
              variant="caption"
              style={{ color: selected ? "#FFFFFF" : colors.text, fontWeight: "700" }}
            >
              {day.charAt(0)}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chip: {
    width: 38,
    height: 38,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
