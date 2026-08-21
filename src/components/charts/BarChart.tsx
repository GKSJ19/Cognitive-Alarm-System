import { View, StyleSheet } from "react-native";

import AppText from "@/components/common/AppText";
import { useAppTheme } from "@/hooks/useAppTheme";

export interface BarChartDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartDatum[];
  /** Optional cap for bar height scaling; defaults to the max value in `data`. */
  maxValue?: number;
  height?: number;
  valueSuffix?: string;
}

/**
 * Lightweight bar chart built from Views only — no charting library
 * dependency required (recharts/victory are not confirmed installed).
 */
export default function BarChart({ data, maxValue, height = 140, valueSuffix = "h" }: BarChartProps) {
  const { colors, radius, spacing } = useAppTheme();
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={[styles.container, { height }]}>
      {data.map((datum) => {
        const barHeight = Math.max((datum.value / max) * (height - 32), 4);
        return (
          <View key={datum.label} style={styles.column}>
            <AppText variant="caption" style={{ color: colors.textSecondary, marginBottom: 4 }}>
              {datum.value}
              {valueSuffix}
            </AppText>

            <View
              style={[
                styles.bar,
                {
                  height: barHeight,
                  borderRadius: radius.sm,
                  backgroundColor: colors.primary,
                },
              ]}
            />

            <AppText
              variant="caption"
              style={{ color: colors.textSecondary, marginTop: spacing.xs }}
            >
              {datum.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    alignItems: "center",
  },
  bar: {
    width: 18,
  },
});
