import { View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";

import { useAppTheme } from "@/hooks/useAppTheme";
import { useSettingsStore } from "@/store/settingsStore";

const TIMEZONES = [
  "GMT+05:30 (India)",
  "GMT+00:00 (UTC)",
  "GMT-05:00 (US Eastern)",
  "GMT-08:00 (US Pacific)",
  "GMT+01:00 (CET)",
  "GMT+09:00 (Japan)",
];

export default function TimezoneSettingsScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const timezone = useSettingsStore((state) => state.timezone);
  const setTimezone = useSettingsStore((state) => state.setTimezone);

  return (
    <Screen>
      <View style={{ flex: 1, padding: spacing.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Timezone" />

        <Card>
          {TIMEZONES.map((tz) => {
            const active = tz === timezone;
            return (
              <TouchableOpacity
                key={tz}
                onPress={() => setTimezone(tz)}
                style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 }}
              >
                <AppText variant="body" style={{ color: active ? colors.primary : colors.text }}>{tz}</AppText>
                {active && <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </Card>
      </View>
    </Screen>
  );
}
