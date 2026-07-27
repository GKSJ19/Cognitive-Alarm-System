import { ScrollView, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import ScoreGauge from "@/components/charts/ScoreGauge";

import { useAppTheme } from "@/hooks/useAppTheme";
import { HABIT_BREAKDOWN } from "@/data/mock/habits";

export default function HabitBreakdownScreen() {
  const { colors, spacing } = useAppTheme();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Score Breakdown" subtitle="What's driving your Habit Score" />

        {HABIT_BREAKDOWN.map((item) => (
          <Card key={item.label} style={{ marginBottom: spacing.md }}>
            <ScoreGauge score={item.score} label={item.label} />
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
