import { View, StyleSheet } from "react-native";

import AppText from "@/components/common/AppText";
import { useAppTheme } from "@/hooks/useAppTheme";

interface ScoreGaugeProps {
  score: number; // 0-100
  label: string;
}

export default function ScoreGauge({ score, label }: ScoreGaugeProps) {
  const { colors, radius, spacing } = useAppTheme();
  const clamped = Math.max(0, Math.min(100, score));

  const scoreColor =
    clamped >= 80 ? colors.success : clamped >= 60 ? colors.warning : colors.error;

  return (
    <View>
      <View style={styles.headerRow}>
        <AppText variant="body" style={{ color: colors.textSecondary }}>
          {label}
        </AppText>
        <AppText variant="subtitle" style={{ color: scoreColor }}>
          {clamped}
        </AppText>
      </View>

      <View
        style={[
          styles.track,
          { backgroundColor: colors.border, borderRadius: radius.round, marginTop: spacing.xs },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${clamped}%`,
              backgroundColor: scoreColor,
              borderRadius: radius.round,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  track: {
    height: 10,
    width: "100%",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});
