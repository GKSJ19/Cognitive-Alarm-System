import { ScrollView, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";
import BarChart from "@/components/charts/BarChart";

import { useAppTheme } from "@/hooks/useAppTheme";
import { USER_DASHBOARD } from "@/data/mock/dashboards";

export default function UserDashboardScreen() {
  const { colors, spacing } = useAppTheme();
  const { alarmHistory, wakeUpStats, challengePerformance, productivityInsights } = USER_DASHBOARD;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="User Dashboard" />

        <Card style={{ marginBottom: spacing.lg }}>
          <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>Alarm History (7 days)</AppText>
          <BarChart data={alarmHistory} valueSuffix="" height={120} />
        </Card>

        <View style={{ flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg }}>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <AppText variant="title">{wakeUpStats.onTimeRate}%</AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>On-time Rate</AppText>
          </Card>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <AppText variant="title">{wakeUpStats.avgSnoozeCount}</AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>Avg Snoozes</AppText>
          </Card>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <AppText variant="title">{wakeUpStats.avgTimeToDismiss}</AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>Avg Dismiss</AppText>
          </Card>
        </View>

        <Card style={{ marginBottom: spacing.lg }}>
          <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>Challenge Performance</AppText>
          <BarChart data={challengePerformance} valueSuffix="%" height={120} />
        </Card>

        <Card>
          <AppText variant="subtitle" style={{ marginBottom: spacing.sm }}>Productivity Insights</AppText>
          {productivityInsights.map((tip) => (
            <AppText key={tip} variant="body" style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>
              • {tip}
            </AppText>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}
