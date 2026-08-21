import { useEffect, useMemo, useState, useCallback } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";
import AppButton from "@/components/buttons/AppButton";
import BarChart from "@/components/charts/BarChart";
import TimePickerField from "@/components/alarms/TimePickerField";

import { useAppTheme } from "@/hooks/useAppTheme";
import { logSleep, getSleepHistory, type BackendSleepLog } from "@/services/api/sleep.api";

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

// bedTime/wakeTime are "HH:MM" local; build ISO datetimes anchored to today
// (wake time rolls to the next day if it's earlier than bedtime).
function toISODateTime(dateISO: string, hhmm: string, rollToNextDay: boolean) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(`${dateISO}T00:00:00`);
  if (rollToNextDay) d.setDate(d.getDate() + 1);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function weekdayLabel(dateISO: string) {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" });
}

export default function SleepLogScreen() {
  const { colors, spacing } = useAppTheme();
  const [bedTime, setBedTime] = useState("22:30");
  const [wakeTime, setWakeTime] = useState("06:30");
  const [quality, setQuality] = useState(4);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<BackendSleepLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await getSleepHistory();
      setHistory(data);
    } catch {
      // leave history empty on failure; chart just shows nothing
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const chartData = useMemo(() => {
    return [...history]
      .slice(0, 7)
      .reverse()
      .map((entry) => ({
        label: weekdayLabel(entry.date),
        value: entry.duration_mins != null ? Math.round((entry.duration_mins / 60) * 10) / 10 : 0,
      }));
  }, [history]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const dateISO = todayISODate();
      const rollWakeToNextDay = wakeTime <= bedTime; // e.g. bed 22:30 -> wake 06:30 next day
      await logSleep({
        date: dateISO,
        sleep_start: toISODateTime(dateISO, bedTime, false),
        sleep_end: toISODateTime(dateISO, wakeTime, rollWakeToNextDay),
        quality,
        source: "manual",
      });
      setSaved(true);
      loadHistory();
    } catch {
      setSaved(false);
    } finally {
      setSaving(false);
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

        <Header title="Sleep Log" subtitle="Log last night's sleep" />

        <Card style={{ marginBottom: spacing.lg }}>
          <AppText variant="body" style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>
            Bedtime
          </AppText>
          <TimePickerField value={bedTime} onChange={setBedTime} />
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <AppText variant="body" style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>
            Wake time
          </AppText>
          <TimePickerField value={wakeTime} onChange={setWakeTime} />
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <AppText variant="body" style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
            Sleep quality
          </AppText>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setQuality(star)} hitSlop={8}>
                <MaterialCommunityIcons
                  name={star <= quality ? "star" : "star-outline"}
                  size={32}
                  color={colors.warning}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <AppButton
          title={saving ? "Saving…" : saved ? "Saved ✓" : "Save Sleep Entry"}
          onPress={handleSave}
          disabled={saving}
        />

        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>
            This Week
          </AppText>
          <Card>
            {loadingHistory ? (
              <AppText variant="body" style={{ color: colors.textSecondary }}>
                Loading…
              </AppText>
            ) : (
              <BarChart data={chartData} />
            )}
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}