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
import { HABIT_SCORE, CURRENT_STREAK, BEST_STREAK } from "@/data/mock/habits";

export default function HabitScoreScreen() {
  const { colors, spacing, radius } = useAppTheme();

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
              {HABIT_SCORE}
            </AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              / 100
            </AppText>
          </View>
        </Card>

        <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.lg }}>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <MaterialCommunityIcons name="fire" size={24} color={colors.warning} />
            <AppText variant="title" style={{ marginTop: spacing.xs }}>
              {CURRENT_STREAK}
            </AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              Current Streak
            </AppText>
          </Card>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <MaterialCommunityIcons name="trophy-outline" size={24} color={colors.primary} />
            <AppText variant="title" style={{ marginTop: spacing.xs }}>
              {BEST_STREAK}
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
            <ScoreGauge score={HABIT_SCORE} label="Overall Consistency" />
          </Card>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader
            title="Calendar History"
            actionLabel="View"
            onActionPress={() => router.push("/habits/calendar")}
          />
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
