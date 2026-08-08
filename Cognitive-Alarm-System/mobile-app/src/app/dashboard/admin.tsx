import { ScrollView, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";
import BarChart from "@/components/charts/BarChart";

import { useAppTheme } from "@/hooks/useAppTheme";
import { ADMIN_DASHBOARD } from "@/data/mock/dashboards";

export default function AdminDashboardScreen() {
  const { colors, spacing } = useAppTheme();
  const { userManagement, platformAnalytics, systemStats } = ADMIN_DASHBOARD;

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
            <AppText variant="title">{userManagement.totalUsers.toLocaleString()}</AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>Total Users</AppText>
          </Card>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <AppText variant="title">{userManagement.activeToday.toLocaleString()}</AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>Active Today</AppText>
          </Card>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <AppText variant="title">+{userManagement.newThisWeek}</AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>New This Week</AppText>
          </Card>
        </View>

        <Card style={{ marginBottom: spacing.lg }}>
          <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>Platform Activity (7 days)</AppText>
          <BarChart data={platformAnalytics} valueSuffix="" height={120} />
        </Card>

        <Card>
          <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>System Statistics</AppText>
          <StatRow label="Uptime" value={systemStats.uptime} />
          <StatRow label="Avg Response Time" value={systemStats.avgResponseTime} />
          <StatRow label="Error Rate" value={systemStats.errorRate} last />
        </Card>
      </ScrollView>
    </Screen>
  );
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
      <AppText variant="body" style={{ color: colors.textSecondary }}>{label}</AppText>
      <AppText variant="body">{value}</AppText>
    </View>
  );
}
