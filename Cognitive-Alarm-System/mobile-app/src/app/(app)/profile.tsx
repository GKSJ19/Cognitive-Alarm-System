import { View, ScrollView, Switch, StyleSheet } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";
import ListRow from "@/components/common/ListRow";
import AppButton from "@/components/buttons/AppButton";

import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function ProfileScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const darkMode = useSettingsStore((state) => state.darkMode);
  const toggleDarkMode = useSettingsStore((state) => state.toggleDarkMode);
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const toggleNotifications = useSettingsStore((state) => state.toggleNotifications);

  const initials = (user?.fullName ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <Header title="Profile" />

        <Card style={{ alignItems: "center", marginBottom: spacing.lg }}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.primary, borderRadius: radius.round },
            ]}
          >
            <AppText variant="title" style={{ color: "#FFFFFF" }}>
              {initials}
            </AppText>
          </View>

          <AppText variant="subtitle" style={{ marginTop: spacing.md }}>
            {user?.fullName ?? "Guest"}
          </AppText>
          <AppText variant="body" style={{ color: colors.textSecondary, marginTop: 2 }}>
            {user?.email}
          </AppText>

          <View style={{ marginTop: spacing.md, width: "100%" }}>
            <AppButton
              title="Edit Profile"
              variant="outline"
              onPress={() => router.push("/onboarding/profile-setup")}
            />
          </View>
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <ListRow
            icon="theme-light-dark"
            title="Dark Mode"
            subtitle={darkMode ? "On" : "Off"}
            right={
              <Switch
                value={darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <ListRow
            icon="bell-outline"
            title="Notifications"
            subtitle={notificationsEnabled ? "Enabled" : "Disabled"}
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <ListRow
            icon="chart-donut"
            title="Habit Score"
            subtitle="Streaks, breakdown & calendar history"
            onPress={() => router.push("/habits")}
            right={<MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />}
          />
          <ListRow
            icon="moon-waning-crescent"
            title="Sleep Log"
            onPress={() => router.push("/sleep/log")}
            right={<MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />}
          />
          <ListRow
            icon="target"
            title="Productivity Goals"
            onPress={() => router.push("/goals/productivity")}
            right={<MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />}
          />
          <ListRow
            icon="lightbulb-on-outline"
            title="Recommendations"
            onPress={() => router.push("/recommendations")}
            right={<MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />}
          />
          <ListRow
            icon="bell-outline"
            title="Notifications"
            onPress={() => router.push("/notifications")}
            right={<MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />}
          />
          <ListRow
            icon="view-dashboard-outline"
            title="Dashboards"
            onPress={() => router.push("/dashboard")}
            right={<MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />}
          />
          <ListRow
            icon="file-chart-outline"
            title="Reports"
            onPress={() => router.push("/reports")}
            right={<MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />}
          />
          <ListRow
            icon="cog-outline"
            title="Settings"
            onPress={() => router.push("/settings")}
            right={<MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />}
          />
        </Card>

        <Card style={{ marginBottom: spacing.xl }}>
          <ListRow
            icon="shield-check-outline"
            title="Privacy & Security"
            right={<MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />}
          />
          <ListRow
            icon="help-circle-outline"
            title="Help & Support"
            right={<MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />}
          />
        </Card>

        <AppButton title="Log Out" variant="outline" onPress={handleLogout} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
});
