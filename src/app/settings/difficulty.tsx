import { View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";

import { useAppTheme } from "@/hooks/useAppTheme";
import { useSettingsStore } from "@/store/settingsStore";

const DIFFICULTIES = [
  { label: "Easy", desc: "Simple math & quick word puzzles" },
  { label: "Medium", desc: "Balanced mix of challenge types" },
  { label: "Hard", desc: "Longer memory sequences, tougher logic" },
  { label: "Extreme", desc: "Maximum difficulty, all challenge types" },
];

export default function DifficultySettingsScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const difficulty = useSettingsStore((state) => state.difficulty);
  const setDifficulty = useSettingsStore((state) => state.setDifficulty);

  return (
    <Screen>
      <View style={{ flex: 1, padding: spacing.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Difficulty" subtitle="How challenging should wake-up challenges be?" />

        {DIFFICULTIES.map((d) => {
          const active = d.label === difficulty;
          return (
            <TouchableOpacity key={d.label} onPress={() => setDifficulty(d.label)} activeOpacity={0.8}>
              <Card
                style={{
                  marginBottom: spacing.md,
                  borderWidth: 1.5,
                  borderColor: active ? colors.primary : "transparent",
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View>
                    <AppText variant="body" style={{ fontWeight: "700", color: active ? colors.primary : colors.text }}>
                      {d.label}
                    </AppText>
                    <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 2 }}>
                      {d.desc}
                    </AppText>
                  </View>
                  {active && <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />}
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>
    </Screen>
  );
}
