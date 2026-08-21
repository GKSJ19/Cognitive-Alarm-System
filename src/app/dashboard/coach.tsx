import { useEffect, useState } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";
import ListRow from "@/components/common/ListRow";
import EmptyState from "@/components/common/EmptyState";

import { useAppTheme } from "@/hooks/useAppTheme";
import { getCoachDashboard, type CoachDashboardResponse } from "@/services/api/dashboard.api";

const TREND_ICON: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  improving: "trending-up",
  declining: "trending-down",
  stable: "trending-neutral",
  no_data: "minus",
  insufficient_history: "minus",
};

export default function CoachDashboardScreen() {
  const { colors, spacing } = useAppTheme();
  const [data, setData] = useState<CoachDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCoachDashboard()
      .then(setData)
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

  const users = data?.users ?? [];
  const scores = users.map((u) => u.habit_adherence.latest_score).filter((s): s is number => s != null);
  const avgHabitScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const atRiskCount = users.filter((u) => u.habit_adherence.trend === "declining").length;
  const improvingCount = users.filter((u) => u.habit_adherence.trend === "improving").length;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Wellness Coach Dashboard" subtitle={`${data?.assigned_user_count ?? 0} assigned users`} />

        <View style={{ flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg }}>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <AppText variant="title">{avgHabitScore ?? "–"}</AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>Avg Habit Score</AppText>
          </Card>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <AppText variant="title" style={{ color: colors.error }}>{atRiskCount}</AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>At Risk</AppText>
          </Card>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <AppText variant="title" style={{ color: colors.success }}>{improvingCount}</AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>Improving</AppText>
          </Card>
        </View>

        <Card>
          <AppText variant="subtitle" style={{ marginBottom: spacing.sm }}>Assigned Users</AppText>
          {users.length === 0 ? (
            <EmptyState icon="account-heart-outline" title="No assigned users yet" />
          ) : (
            users.map((u) => (
              <ListRow
                key={u.user_id}
                icon="account-outline"
                title={u.name}
                subtitle={
                  u.habit_adherence.latest_score != null
                    ? `Habit Score: ${Math.round(u.habit_adherence.latest_score)} · Sleep: ${u.sleep_trend.average_duration_mins != null ? `${Math.round(u.sleep_trend.average_duration_mins / 60 * 10) / 10}h` : "–"}`
                    : "No score data yet"
                }
                right={
                  <MaterialCommunityIcons
                    name={TREND_ICON[u.habit_adherence.trend]}
                    size={20}
                    color={u.habit_adherence.trend === "improving" ? colors.success : u.habit_adherence.trend === "declining" ? colors.error : colors.textSecondary}
                  />
                }
              />
            ))
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}