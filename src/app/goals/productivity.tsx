import { useEffect, useState } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/forms/AppInput";
import EmptyState from "@/components/common/EmptyState";

import { useAppTheme } from "@/hooks/useAppTheme";
import {
  logGoalMetric,
  getGoalHistory,
  deleteGoalMetric,
  type GoalMetricEntry,
  type BackendGoalType,
} from "@/services/api/goal.api";

const GOAL_TYPES: { label: string; value: BackendGoalType }[] = [
  { label: "Study", value: "study" },
  { label: "Work", value: "work" },
  { label: "Fitness", value: "fitness" },
];

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

export default function ProductivityGoalScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const [entries, setEntries] = useState<GoalMetricEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [goalType, setGoalType] = useState<BackendGoalType>("study");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getGoalHistory()
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const canSubmit = label.trim().length > 0 && value.trim().length > 0 && !isNaN(Number(value));

  const handleAdd = async () => {
    setError(null);
    setSaving(true);
    try {
      await logGoalMetric({
        date: todayISODate(),
        goal_type: goalType,
        metric_label: label.trim(),
        metric_value: Number(value),
      });
      setLabel("");
      setValue("");
      setShowForm(false);
      load();
    } catch {
      setError("Couldn't save this entry. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteGoalMetric(id);
    } catch {
      load(); // reconcile if the delete failed server-side
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Productivity Goals" subtitle="Log progress on the metrics that matter to you" />

        {showForm && (
          <Card style={{ marginBottom: spacing.lg }}>
            <AppText variant="body" style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>
              Category
            </AppText>
            <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md }}>
              {GOAL_TYPES.map((g) => {
                const active = g.value === goalType;
                return (
                  <TouchableOpacity
                    key={g.value}
                    onPress={() => setGoalType(g.value)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: radius.round,
                      borderWidth: 1.5,
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary + "1A" : "transparent",
                    }}
                  >
                    <AppText variant="caption" style={{ color: active ? colors.primary : colors.textSecondary }}>
                      {g.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <AppText variant="body" style={{ color: colors.textSecondary, marginBottom: spacing.xs }}>
              What are you tracking?
            </AppText>
            <AppInput value={label} onChangeText={setLabel} placeholder="e.g. Study hours, Deep work sessions" />

            <AppText variant="body" style={{ color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.xs }}>
              Today's value
            </AppText>
            <AppInput value={value} onChangeText={setValue} placeholder="e.g. 3.5" keyboardType="decimal-pad" />

            {error && (
              <AppText variant="caption" style={{ color: colors.error, marginTop: spacing.sm }}>
                {error}
              </AppText>
            )}

            <View style={{ marginTop: spacing.md }}>
              <AppButton title={saving ? "Saving…" : "Save Entry"} onPress={handleAdd} disabled={!canSubmit || saving} />
            </View>
          </Card>
        )}

        {!showForm && (
          <AppButton title="+ Log Progress" variant="outline" onPress={() => setShowForm(true)} />
        )}

        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>
            Recent Entries
          </AppText>
          {loading ? (
            <AppText variant="body" style={{ color: colors.textSecondary }}>
              Loading…
            </AppText>
          ) : entries.length === 0 ? (
            <EmptyState icon="chart-line" title="No entries yet" subtitle="Log your first data point above." />
          ) : (
            entries.map((entry) => (
              <Card key={entry.id} style={{ marginBottom: spacing.sm, flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <AppText variant="body" style={{ fontWeight: "700" }}>
                    {entry.metric_label}
                  </AppText>
                  <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 2, textTransform: "capitalize" }}>
                    {entry.goal_type} · {entry.date}
                  </AppText>
                </View>
                <AppText variant="title" style={{ marginRight: spacing.md }}>
                  {entry.metric_value}
                </AppText>
                <TouchableOpacity onPress={() => handleDelete(entry.id)} hitSlop={8}>
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}