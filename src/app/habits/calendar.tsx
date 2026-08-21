import { useEffect, useState } from "react";
import { ScrollView, View, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";

import { useAppTheme } from "@/hooks/useAppTheme";
import { getHabitHistory, type BackendCalendarDay } from "@/services/api/habit.api";

const STATUS_ICON: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  success: "check-circle",
  missed: "close-circle",
  snoozed: "sleep",
  future: "circle-outline",
  none: "circle-outline",
};

export default function CalendarHistoryScreen() {
  const { colors, spacing } = useAppTheme();
  const [cursor, setCursor] = useState(new Date());
  const [days, setDays] = useState<BackendCalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  useEffect(() => {
    setLoading(true);
    getHabitHistory(cursor.getFullYear(), cursor.getMonth() + 1) // backend expects 1-12
      .then(setDays)
      .catch(() => setDays([]))
      .finally(() => setLoading(false));
  }, [cursor]);

  const statusColor = (status: string) =>
    status === "success" ? colors.success : status === "missed" ? colors.error : status === "snoozed" ? colors.warning : colors.border;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Calendar History" />

        <Card>
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
              <MaterialCommunityIcons name="chevron-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <AppText variant="subtitle">{monthLabel}</AppText>
            <TouchableOpacity onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <AppText variant="body" style={{ color: colors.textSecondary, marginTop: spacing.lg }}>
              Loading…
            </AppText>
          ) : (
            <View style={[styles.grid, { marginTop: spacing.lg }]}>
              {days.map((d) => (
                <View key={d.date} style={styles.cell}>
                  <MaterialCommunityIcons name={STATUS_ICON[d.status]} size={18} color={statusColor(d.status)} />
                  <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 2 }}>
                    {d.day}
                  </AppText>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card style={{ marginTop: spacing.lg, flexDirection: "row", justifyContent: "space-around" }}>
          <Legend color={colors.success} label="On time" />
          <Legend color={colors.warning} label="Snoozed" />
          <Legend color={colors.error} label="Missed" />
        </Card>
      </ScrollView>
    </Screen>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginBottom: 4 }} />
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  monthRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.28%", alignItems: "center", marginBottom: 12 },
});