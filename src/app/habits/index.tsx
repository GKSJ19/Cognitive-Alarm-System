import { useEffect, useState } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";
import ScoreGauge from "@/components/charts/ScoreGauge";
import SectionHeader from "@/components/common/SectionHeader";

import { useAppTheme } from "@/hooks/useAppTheme";
import {
  getHabitScore,
  getHabitStreaks,
  type HabitScoreResponse,
  type StreaksResponse,
} from "@/services/api/habit.api";

export default function HabitScoreScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const [data, setData] = useState<HabitScoreResponse | null>(null);
  const [streaks, setStreaks] = useState<StreaksResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getHabitScore(), getHabitStreaks()])
      .then(([scoreRes, streaksRes]) => {
        setData(scoreRes);
        setStreaks(streaksRes);
      })
      .catch(() => {
        setData(null);
        setStreaks(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const score = data?.total_score ?? null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Habit Score" subtitle="How consistently you're building better mornings" />

        <Card style={{ alignItems: "center", paddingVertical: spacing.xl }}>
          <View
            style={{
              width: 140,
              height: 140,
              borderRadius: radius.round,
              borderWidth: 10,
              borderColor: colors.success,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AppText variant="title" style={{ fontSize: 40 }}>
              {loading ? "…" : score ?? "–"}
            </AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              / 100
            </AppText>
          </View>
          {!loading && data?.insufficient_data && (
            <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: spacing.sm, textAlign: "center" }}>
              Not enough activity yet to calculate a score.
            </AppText>
          )}
        </Card>

        <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.lg }}>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <MaterialCommunityIcons name="fire" size={24} color={colors.warning} />
            <AppText variant="title" style={{ marginTop: spacing.xs }}>
              {loading ? "…" : streaks?.current_streak ?? 0}
            </AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              Current Streak
            </AppText>
          </Card>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <MaterialCommunityIcons name="trophy-outline" size={24} color={colors.primary} />
            <AppText variant="title" style={{ marginTop: spacing.xs }}>
              {loading ? "…" : streaks?.best_streak ?? 0}
            </AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              Best Streak
            </AppText>
          </Card>
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <SectionHeader
            title="Score Breakdown"
            actionLabel="Details"
            onActionPress={() => router.push("/habits/breakdown")}
          />
          <Card>
            <ScoreGauge score={score ?? 0} label="Overall Consistency" />
          </Card>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader title="Calendar History" actionLabel="View" onActionPress={() => router.push("/habits/calendar")} />
          <Card>
            <AppText variant="body" style={{ color: colors.textSecondary }}>
              See a day-by-day view of on-time wake-ups, snoozes, and missed alarms.
            </AppText>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}