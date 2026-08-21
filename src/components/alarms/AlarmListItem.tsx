import { View, StyleSheet, Switch, TouchableOpacity } from "react-native";

import AppText from "@/components/common/AppText";
import Card from "@/components/cards/Card";
import { Alarm } from "@/types/alarm";
import { formatTime12h } from "@/utils/date";
import { formatRepeatDays } from "@/utils/alarm";
import { useAppTheme } from "@/hooks/useAppTheme";

interface AlarmListItemProps {
  alarm: Alarm;
  onToggle: (enabled: boolean) => void;
  onPress: () => void;
}

export default function AlarmListItem({ alarm, onToggle, onPress }: AlarmListItemProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <Card style={{ marginBottom: spacing.md }}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <AppText
              variant="title"
              style={[styles.time, !alarm.enabled && { color: colors.textSecondary }]}
            >
              {formatTime12h(alarm.time)}
            </AppText>

            <AppText variant="body" style={{ color: colors.textSecondary, marginTop: 2 }}>
              {alarm.label}
            </AppText>

            <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 4 }}>
              {formatRepeatDays(alarm.repeatDays)}
            </AppText>
          </View>

          <Switch
            value={alarm.enabled}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    fontSize: 26,
  },
});
