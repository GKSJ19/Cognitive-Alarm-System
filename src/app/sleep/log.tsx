import { useState } from "react";
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
import { DUMMY_SLEEP_SUMMARY } from "@/data/sleepData";

export default function SleepLogScreen() {
  const { colors, spacing } = useAppTheme();
  const [bedTime, setBedTime] = useState("22:30");
  const [wakeTime, setWakeTime] = useState("06:30");
  const [quality, setQuality] = useState(4);
  const [saved, setSaved] = useState(false);

  const chartData = DUMMY_SLEEP_SUMMARY.weekly.map((d) => ({ label: d.day, value: d.hours }));

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
          title={saved ? "Saved ✓" : "Save Sleep Entry"}
          onPress={() => setSaved(true)}
        />

        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>
            This Week
          </AppText>
          <Card>
            <BarChart data={chartData} />
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}
