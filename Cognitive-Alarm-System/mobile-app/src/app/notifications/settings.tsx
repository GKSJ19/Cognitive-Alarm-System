import { ScrollView, View, Switch, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import ListRow from "@/components/common/ListRow";

import { useAppTheme } from "@/hooks/useAppTheme";
import { useSettingsStore, NotificationPrefs } from "@/store/settingsStore";

const LABELS: { key: keyof NotificationPrefs; title: string; subtitle: string; icon: string }[] = [
  { key: "push", title: "Push Notifications", subtitle: "Alerts on your device", icon: "bell-outline" },
  { key: "email", title: "Email Notifications", subtitle: "Weekly summaries via email", icon: "email-outline" },
  { key: "sound", title: "Notification Sound", subtitle: "Play a sound for alerts", icon: "volume-high" },
  { key: "recommendations", title: "Recommendations", subtitle: "Personalized tips and insights", icon: "lightbulb-on-outline" },
  { key: "habitReminders", title: "Habit Reminders", subtitle: "Nudges to keep your streak", icon: "fire" },
];

export default function NotificationSettingsScreen() {
  const { colors, spacing } = useAppTheme();
  const prefs = useSettingsStore((state) => state.notificationPrefs);
  const setNotificationPrefs = useSettingsStore((state) => state.setNotificationPrefs);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Notification Preferences" />

        <Card>
          {LABELS.map((item) => (
            <ListRow
              key={item.key}
              icon={item.icon as any}
              title={item.title}
              subtitle={item.subtitle}
              right={
                <Switch
                  value={prefs[item.key]}
                  onValueChange={(value) => setNotificationPrefs({ [item.key]: value })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              }
            />
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}
