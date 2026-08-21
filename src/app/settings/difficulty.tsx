import { useEffect, useState } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";

import { useAppTheme } from "@/hooks/useAppTheme";
import { useSettingsStore } from "@/store/settingsStore";
import * as difficultyApi from "@/services/api/difficulty.api";
import type { DifficultyResponse } from "@/services/api/difficulty.api";

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

  const [current, setCurrent] = useState<DifficultyResponse | null>(null);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(true);

  useEffect(() => {
    difficultyApi
      .getCurrentDifficulty()
      .then(setCurrent)
      .catch(() => setCurrent(null))
      .finally(() => setIsLoadingCurrent(false));
  }, []);

  return (
    <Screen>
      <View style={{ flex: 1, padding: spacing.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Difficulty" subtitle="How challenging should wake-up challenges be?" />

        <Card style={{ marginBottom: spacing.lg }}>
          <AppText variant="caption" style={{ color: colors.textSecondary }}>
            CURRENT ADAPTIVE DIFFICULTY
          </AppText>
          {isLoadingCurrent ? (
            <ActivityIndicator style={{ marginTop: spacing.sm }} color={colors.primary} />
          ) : current ? (
            <>
              <AppText variant="subtitle" style={{ marginTop: 4, color: colors.primary, textTransform: "capitalize" }}>
                {current.difficulty}
              </AppText>
              <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 4 }}>
                {current.recent_attempts_considered > 0
                  ? `${current.recent_accuracy_percent}% accuracy over your last ${current.recent_attempts_considered} attempts`
                  : "No attempts yet — this updates as you solve wake-up challenges"}
              </AppText>
            </>
          ) : (
            <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 4 }}>
              Couldn't load your current difficulty.
            </AppText>
          )}
        </Card>

        <AppText variant="caption" style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>
          YOUR PREFERENCE
        </AppText>

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
