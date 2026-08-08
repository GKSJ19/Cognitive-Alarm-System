import { View, TouchableOpacity, Switch } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import ListRow from "@/components/common/ListRow";

import { useAppTheme } from "@/hooks/useAppTheme";

export default function ThemeSettingsScreen() {
  const { colors, spacing, darkMode, toggleDarkMode } = useAppTheme();

  return (
    <Screen>
      <View style={{ flex: 1, padding: spacing.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Theme" subtitle="Appearance across the whole app" />

        <Card>
          <ListRow
            icon="white-balance-sunny"
            title="Light Mode"
            subtitle="Bright background, dark text"
            right={
              <Switch
                value={!darkMode}
                onValueChange={() => darkMode && toggleDarkMode()}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <ListRow
            icon="moon-waning-crescent"
            title="Dark Mode"
            subtitle="Dark background, light text"
            right={
              <Switch
                value={darkMode}
                onValueChange={() => !darkMode && toggleDarkMode()}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </Card>
      </View>
    </Screen>
  );
}
