import { useState } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";
import AppButton from "@/components/buttons/AppButton";

import { useAppTheme } from "@/hooks/useAppTheme";
import {
  generateReport,
  downloadReportFile,
  type BackendReport,
  type BackendReportType,
} from "@/services/api/report.api";

const REPORT_TYPES: { label: string; value: BackendReportType }[] = [
  { label: "Sleep Summary", value: "sleep" },
  { label: "Alarm & Wake-up History", value: "wakeup" },
  { label: "Habit Score Trend", value: "habit" },
  { label: "Challenge Performance", value: "challenge" },
  { label: "Productivity Insights", value: "productivity" },
];

const RANGES: { label: string; days: number }[] = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

export default function ReportsScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const [reportType, setReportType] = useState<BackendReportType>(REPORT_TYPES[0].value);
  const [days, setDays] = useState(RANGES[0].days);
  const [report, setReport] = useState<BackendReport | null>(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState<"pdf" | "excel" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (format: "pdf" | "excel") => {
    setGenerating(true);
    setError(null);
    try {
      const result = await generateReport({ report_type: reportType, format, days });
      setReport(result);
    } catch {
      setError("Couldn't generate the report. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!report) return;
    setDownloading(report.format);
    setError(null);
    try {
      const localUri = await downloadReportFile(report);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri);
      }
    } catch (e: any) {
      setError(e?.message ?? "Download failed.");
    } finally {
      setDownloading(null);
    }
  };

  const selectedLabel = REPORT_TYPES.find((t) => t.value === reportType)?.label ?? "";
  const selectedRangeLabel = RANGES.find((r) => r.days === days)?.label ?? `Last ${days} days`;

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
            const active = type.value === reportType;
            return (
              <TouchableOpacity
                key={type.value}
                onPress={() => {
                  setReportType(type.value);
                  setReport(null);
                }}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 10,
                }}
              >
                <AppText variant="body" style={{ color: active ? colors.primary : colors.text }}>
                  {type.label}
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
              const active = r.days === days;
              return (
                <TouchableOpacity
                  key={r.label}
                  onPress={() => {
                    setDays(r.days);
                    setReport(null);
                  }}
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
                    {r.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <AppButton
          title={generating ? "Generating…" : "Generate PDF Report"}
          onPress={() => handleGenerate("pdf")}
          disabled={generating}
        />
        <View style={{ marginTop: spacing.sm }}>
          <AppButton
            title={generating ? "Generating…" : "Generate Excel Report"}
            variant="outline"
            onPress={() => handleGenerate("excel")}
            disabled={generating}
          />
        </View>

        {error && (
          <AppText variant="caption" style={{ color: colors.error, marginTop: spacing.md }}>
            {error}
          </AppText>
        )}

        {report && (
          <Card style={{ marginTop: spacing.lg }}>
            <AppText variant="subtitle" style={{ marginBottom: spacing.xs }}>
              {selectedLabel}
            </AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary, marginBottom: spacing.lg }}>
              {selectedRangeLabel} · {report.format.toUpperCase()}
            </AppText>

            <AppButton
              title={downloading ? "Downloading…" : `Download ${report.format.toUpperCase()}`}
              variant="outline"
              onPress={handleDownload}
              disabled={!!downloading}
            />
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}