import { useEffect, useState } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";

import { useAppTheme } from "@/hooks/useAppTheme";
import {
  getAdminDashboard,
  getSystemMetrics,
  type AdminDashboardResponse,
  type SystemMetrics,
} from "@/services/api/dashboard.api";

export default function AdminDashboardScreen() {
  const { colors, spacing } = useAppTheme();
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminDashboard(), getSystemMetrics()])
      .then(([dashboard, sys]) => {
        setData(dashboard);
        setMetrics(sys);
      })
      .catch(() => {
        setData(null);
        setMetrics(null);
      })
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

  const um = data?.user_management;
  const pa = data?.platform_analytics;
  const rec = data?.recommendation_monitoring;
  const rep = data?.system_reports;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Admin Dashboard" />

        <View style={{ flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg }}>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <AppText variant="title">{um?.total_users.toLocaleString() ?? "–"}</AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>Total Users</AppText>
          </Card>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <AppText variant="title">{um?.active_users.toLocaleString() ?? "–"}</AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>Active Users</AppText>
          </Card>
        </View>

        <Card style={{ marginBottom: spacing.lg }}>
          <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>Users by Role</AppText>
          {um && Object.entries(um.by_role).map(([role, count]) => (
            <StatRow key={role} label={role} value={String(count)} />
          ))}
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>Platform Activity</AppText>
          <StatRow label="Total Alarms" value={String(pa?.total_alarms ?? "–")} />
          <StatRow label="Active Alarms" value={String(pa?.active_alarms ?? "–")} />
          <StatRow label="Total Alarm Triggers" value={String(pa?.total_alarm_triggers ?? "–")} />
          <StatRow label="Total Challenge Attempts" value={String(pa?.total_challenge_attempts ?? "–")} />
          <StatRow label="Avg Habit Score (platform-wide)" value={pa?.average_habit_score_platform_wide != null ? String(pa.average_habit_score_platform_wide) : "–"} last />
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>Recommendation Monitoring</AppText>
          <StatRow label="Total Recommendations" value={String(rec?.total_recommendations ?? "–")} />
          <StatRow label="Unread" value={String(rec?.unread ?? "–")} last />
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>System Reports</AppText>
          <StatRow label="Total Generated" value={String(rep?.total_reports_generated ?? "–")} last />
        </Card>

        <Card style={{ marginTop: spacing.lg }}>
          <AppText variant="subtitle" style={{ marginBottom: spacing.xs }}>System Performance</AppText>
          <AppText variant="caption" style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
            Since last restart — single-process only, not aggregated across replicas
          </AppText>
          <StatRow label="Uptime" value={metrics ? formatUptime(metrics.uptime_seconds) : "–"} />
          <StatRow label="Requests Served" value={metrics ? metrics.request_count.toLocaleString() : "–"} />
          <StatRow label="Avg Response Time" value={metrics?.avg_response_time_ms != null ? `${metrics.avg_response_time_ms}ms` : "–"} />
          <StatRow label="Error Rate" value={metrics ? `${metrics.error_rate_percent}%` : "–"} last />
        </Card>
      </ScrollView>
    </Screen>
  );
}

function formatUptime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}

function StatRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
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
      <AppText variant="body" style={{ color: colors.textSecondary, textTransform: "capitalize" }}>{label.replace(/_/g, " ")}</AppText>
      <AppText variant="body">{value}</AppText>
    </View>
  );
}