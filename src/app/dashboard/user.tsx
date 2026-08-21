import { useEffect, useState } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";
import EmptyState from "@/components/common/EmptyState";

import { useAppTheme } from "@/hooks/useAppTheme";
import { getUserDashboard, type UserDashboardResponse } from "@/services/api/dashboard.api";
import { getChallengeStats } from "@/services/api/challenge.api";
import BarChart from "@/components/charts/BarChart";
import { minuteOfDayToClock, formatRelativeTime } from "@/utils/dashboardFormat";

export default function UserDashboardScreen() {
  const { colors, spacing } = useAppTheme();
  const [data, setData] = useState<UserDashboardResponse | null>(null);
  const [categoryChart, setCategoryChart] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUserDashboard(), getChallengeStats()])
      .then(([dashboard, stats]) => {
        setData(dashboard);
        setCategoryChart(
          Object.entries(stats.by_category ?? {}).map(([label, s]: [string, any]) => ({
            label,
            value: s.accuracy_percent ?? 0,
          }))
        );
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Screen>
        <View style={{ padding: 24 }}>
          <AppText variant="body" style={{ color: colors.textSecondary }}>Loading…</AppText>
        </View>
      </Screen>
    );
  }

  const stats = data?.wake_up_stats;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="User Dashboard" />

        <View style={{ flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg }}>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <AppText variant="title">{minuteOfDayToClock(stats?.wake_time_consistency.average_wake_minute_of_day ?? null)}</AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>Avg Wake Time</AppText>
          </Card>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <AppText variant="title">{stats?.snooze_trend.overall_average_snoozes ?? "–"}</AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>Avg Snoozes</AppText>
          </Card>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <AppText variant="title">{stats?.wake_time_consistency.std_dev_minutes != null ? `±${stats.wake_time_consistency.std_dev_minutes}m` : "–"}</AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>Wake Consistency</AppText>
          </Card>
        </View>

        <Card style={{ marginBottom: spacing.lg }}>
          <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>Challenge Accuracy by Category</AppText>
          {categoryChart.length > 0 ? (
            <BarChart data={categoryChart} valueSuffix="%" height={120} />
          ) : (
            <AppText variant="body" style={{ color: colors.textSecondary }}>No challenge attempts yet.</AppText>
          )}
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <AppText variant="subtitle" style={{ marginBottom: spacing.sm }}>Recent Alarm History</AppText>
          {data && data.alarm_history.length > 0 ? (
            data.alarm_history.map((entry, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: spacing.sm,
                  borderBottomWidth: i === data.alarm_history.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border,
                }}
              >
                <View>
                  <AppText variant="body">{entry.alarm_label}</AppText>
                  <AppText variant="caption" style={{ color: colors.textSecondary }}>
                    {formatRelativeTime(entry.triggered_at)}
                    {entry.snooze_count > 0 ? ` · ${entry.snooze_count} snooze${entry.snooze_count > 1 ? "s" : ""}` : ""}
                  </AppText>
                </View>
                <AppText variant="caption" style={{ color: entry.status === "passed" ? colors.success : colors.error, alignSelf: "center" }}>
                  {entry.status}
                </AppText>
              </View>
            ))
          ) : (
            <AppText variant="body" style={{ color: colors.textSecondary }}>No alarm activity yet.</AppText>
          )}
        </Card>

        <Card>
          <AppText variant="subtitle" style={{ marginBottom: spacing.sm }}>Productivity Insights</AppText>
          {data && data.productivity_insights.length > 0 ? (
            data.productivity_insights.map((p, i) => (
              <AppText key={i} variant="body" style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>
                • {p.metric_label}: {p.value} ({p.date})
              </AppText>
            ))
          ) : (
            <TouchableOpacity onPress={() => router.push("/goals/productivity")}>
              <EmptyState icon="chart-line" title="No productivity data yet" subtitle="Tap to log your first entry." />
            </TouchableOpacity>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}