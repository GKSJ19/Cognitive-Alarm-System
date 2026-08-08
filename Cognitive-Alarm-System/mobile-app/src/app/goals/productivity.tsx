import { useState } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";
import AppButton from "@/components/buttons/AppButton";
import ScoreGauge from "@/components/charts/ScoreGauge";

import { useAppTheme } from "@/hooks/useAppTheme";

const GOALS = [
  { id: "g1", title: "Deep work before 10 AM", progress: 68 },
  { id: "g2", title: "No screens after 11 PM", progress: 45 },
  { id: "g3", title: "Exercise 3x this week", progress: 90 },
];

export default function ProductivityGoalScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const [addingGoal, setAddingGoal] = useState(false);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Productivity Goals" subtitle="Track the habits that compound" />

        {GOALS.map((goal) => (
          <Card key={goal.id} style={{ marginBottom: spacing.md }}>
            <ScoreGauge score={goal.progress} label={goal.title} />
          </Card>
        ))}

        <AppButton
          title={addingGoal ? "Goal added ✓" : "+ Add New Goal"}
          variant="outline"
          onPress={() => setAddingGoal(true)}
        />
      </ScrollView>
    </Screen>
  );
}
