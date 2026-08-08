import { useState } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";
import AppButton from "@/components/buttons/AppButton";

import { useAppTheme } from "@/hooks/useAppTheme";
import { REPORT_TYPES } from "@/data/mock/reports";

const RANGES = ["Last 7 days", "Last 30 days", "Last 90 days", "Custom"];

export default function ReportsScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [range, setRange] = useState(RANGES[0]);
  const [generated, setGenerated] = useState(false);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Reports" subtitle="Generate a shareable report" />

        <Card style={{ marginBottom: spacing.lg }}>
          <AppText variant="body" style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
            Report Type
          </AppText>
          {REPORT_TYPES.map((type) => {
            const active = type === reportType;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => { setReportType(type); setGenerated(false); }}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 10,
                }}
              >
                <AppText variant="body" style={{ color: active ? colors.primary : colors.text }}>
                  {type}
                </AppText>
                {active && <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <AppText variant="body" style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
            Date Range
          </AppText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {RANGES.map((r) => {
              const active = r === range;
              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => { setRange(r); setGenerated(false); }}
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
                    {r}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <AppButton title="Generate Report" onPress={() => setGenerated(true)} />

        {generated && (
          <Card style={{ marginTop: spacing.lg }}>
            <AppText variant="subtitle" style={{ marginBottom: spacing.xs }}>
              {reportType}
            </AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary, marginBottom: spacing.lg }}>
              {range}
            </AppText>

            <View style={{ gap: spacing.sm }}>
              <AppButton
                title="Download PDF"
                variant="outline"
                onPress={() =>
                  // No document-generation backend is wired up yet — UI only.
                  {}
                }
              />
              <AppButton
                title="Download Excel"
                variant="outline"
                onPress={() => {}}
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}
