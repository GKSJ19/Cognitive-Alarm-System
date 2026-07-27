import { ScrollView, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";
import ListRow from "@/components/common/ListRow";
import BarChart from "@/components/charts/BarChart";

import { useAppTheme } from "@/hooks/useAppTheme";
import { COACH_DASHBOARD } from "@/data/mock/dashboards";

const TREND_ICON = { up: "trending-up", down: "trending-down", flat: "trending-neutral" } as const;

export default function CoachDashboardScreen() {
  const { colors, spacing } = useAppTheme();
  const { assignedUsers, sleepTrends, habitAnalytics } = COACH_DASHBOARD;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Wellness Coach Dashboard" />

        <View style={{ flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg }}>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <AppText variant="title">{habitAnalytics.avgHabitScore}</AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>Avg Habit Score</AppText>
          </Card>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <AppText variant="title" style={{ color: colors.error }}>{habitAnalytics.atRiskUsers}</AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>At Risk</AppText>
          </Card>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <AppText variant="title" style={{ color: colors.success }}>{habitAnalytics.improvingUsers}</AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>Improving</AppText>
          </Card>
        </View>

        <Card style={{ marginBottom: spacing.lg }}>
          <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>Sleep Trends (avg hours)</AppText>
          <BarChart data={sleepTrends} height={120} />
        </Card>

        <Card>
          <AppText variant="subtitle" style={{ marginBottom: spacing.sm }}>Assigned Users</AppText>
          {assignedUsers.map((u) => (
            <ListRow
              key={u.id}
              icon="account-outline"
              title={u.name}
              subtitle={`Habit Score: ${u.habitScore}`}
              right={<MaterialCommunityIcons name={TREND_ICON[u.trend]} size={20} color={u.trend === "up" ? colors.success : u.trend === "down" ? colors.error : colors.textSecondary} />}
            />
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}
