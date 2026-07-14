import { useState } from "react";
import { ScrollView, View, TouchableOpacity, StyleSheet } from "react-native";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";
import BarChart from "@/components/charts/BarChart";
import ScoreGauge from "@/components/charts/ScoreGauge";

import { DUMMY_SLEEP_SUMMARY, AI_SUGGESTIONS } from "@/data/sleepData";
import { useAppTheme } from "@/hooks/useAppTheme";

type Range = "weekly" | "monthly";

export default function AnalyticsScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const [range, setRange] = useState<Range>("weekly");
  const sleep = DUMMY_SLEEP_SUMMARY;

  const chartData =
    range === "weekly"
      ? sleep.weekly.map((d) => ({ label: d.day, value: d.hours }))
      : sleep.monthly.map((d) => ({ label: d.week, value: d.hours }));

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <Header title="Analytics" subtitle="Your sleep, at a glance" />

        <View style={[styles.row, { gap: spacing.md }]}>
          <Card style={styles.halfCard}>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              Average Sleep
            </AppText>
            <AppText variant="title" style={{ marginTop: spacing.xs }}>
              {sleep.averageHours}h
            </AppText>
          </Card>

          <Card style={styles.halfCard}>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              Avg. Quality
            </AppText>
            <AppText variant="title" style={{ marginTop: spacing.xs }}>
              {sleep.averageQuality}%
            </AppText>
          </Card>
        </View>

        <Card style={{ marginTop: spacing.lg }}>
          <View style={styles.chartHeader}>
            <AppText variant="subtitle">Sleep Hours</AppText>

            <View
              style={[
                styles.toggle,
                { borderRadius: radius.round, borderColor: colors.border },
              ]}
            >
              <RangeTab label="Weekly" active={range === "weekly"} onPress={() => setRange("weekly")} />
              <RangeTab
                label="Monthly"
                active={range === "monthly"}
                onPress={() => setRange("monthly")}
              />
            </View>
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <BarChart data={chartData} />
          </View>
        </Card>

        <Card style={{ marginTop: spacing.lg }}>
          <ScoreGauge score={sleep.sleepScore} label="Sleep Score" />
        </Card>

        <Card style={{ marginTop: spacing.lg }}>
          <AppText variant="subtitle" style={{ marginBottom: spacing.sm }}>
            🤖 AI Recommendation
          </AppText>
          {AI_SUGGESTIONS.map((tip) => (
            <AppText
              key={tip}
              variant="body"
              style={{ color: colors.textSecondary, marginBottom: spacing.sm }}
            >
              • {tip}
            </AppText>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );

  function RangeTab({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.toggleItem,
          {
            borderRadius: radius.round,
            backgroundColor: active ? colors.primary : "transparent",
          },
        ]}
      >
        <AppText
          variant="caption"
          style={{ color: active ? "#FFFFFF" : colors.textSecondary, fontWeight: "700" }}
        >
          {label}
        </AppText>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginTop: 16,
  },
  halfCard: {
    flex: 1,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggle: {
    flexDirection: "row",
    borderWidth: 1,
    padding: 2,
  },
  toggleItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
