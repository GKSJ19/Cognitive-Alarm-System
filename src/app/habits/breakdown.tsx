import { useEffect, useState } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import ScoreGauge from "@/components/charts/ScoreGauge";
import AppText from "@/components/common/AppText";

import { useAppTheme } from "@/hooks/useAppTheme";
import { getHabitScore, type HabitScoreResponse } from "@/services/api/habit.api";

const CATEGORIES: { key: keyof HabitScoreResponse; label: string; icon: string }[] = [
  { key: "wake_consistency_score", label: "Wake-up Consistency", icon: "alarm-check" },
  { key: "challenge_success_score", label: "Challenge Completion", icon: "puzzle-check-outline" },
  { key: "snooze_reduction_score", label: "Snooze Discipline", icon: "sleep" },
  { key: "sleep_adherence_score", label: "Sleep Duration", icon: "moon-waning-crescent" },
  // No "Goal Progress" — backend has no such category.
];

export default function HabitBreakdownScreen() {
  const { colors, spacing } = useAppTheme();
  const [data, setData] = useState<HabitScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHabitScore()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Score Breakdown" subtitle="What's driving your Habit Score" />

        {loading && (
          <AppText variant="body" style={{ color: colors.textSecondary }}>
            Loading…
          </AppText>
        )}

        {!loading &&
          CATEGORIES.map((cat) => {
            const value = data?.[cat.key];
            const hasData = typeof value === "number";
            return (
              <Card key={cat.label} style={{ marginBottom: spacing.md }}>
                <ScoreGauge score={hasData ? (value as number) : 0} label={cat.label} />
                {!hasData && (
                  <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: spacing.xs }}>
                    Not enough data yet
                  </AppText>
                )}
              </Card>
            );
          })}
      </ScrollView>
    </Screen>
  );
}