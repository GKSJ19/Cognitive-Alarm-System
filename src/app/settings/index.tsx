import { View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import ListRow from "@/components/common/ListRow";

import { useAppTheme } from "@/hooks/useAppTheme";

const ITEMS = [
  { href: "/settings/account", title: "Account Settings", subtitle: "Name, email & password", icon: "account-cog-outline" },
  { href: "/notifications/settings", title: "Notification Preferences", subtitle: "Push, email & sound", icon: "bell-cog-outline" },
  { href: "/settings/timezone", title: "Timezone", subtitle: "Set your local timezone", icon: "earth" },
  { href: "/settings/difficulty", title: "Difficulty", subtitle: "Challenge difficulty preference", icon: "speedometer" },
  { href: "/settings/theme", title: "Theme", subtitle: "Dark mode & appearance", icon: "palette-outline" },
] as const;

export default function SettingsHubScreen() {
  const { colors, spacing } = useAppTheme();

  return (
    <Screen>
      <View style={{ flex: 1, padding: spacing.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Settings" />

        <Card>
          {ITEMS.map((item) => (
            <ListRow
              key={item.href}
              icon={item.icon as any}
              title={item.title}
              subtitle={item.subtitle}
              onPress={() => router.push(item.href)}
              right={<MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />}
            />
          ))}
        </Card>
      </View>
    </Screen>
  );
}
