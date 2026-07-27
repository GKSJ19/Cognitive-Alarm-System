import { View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";

import { useAppTheme } from "@/hooks/useAppTheme";

const DASHBOARDS = [
  { href: "/dashboard/user", title: "User Dashboard", subtitle: "Your alarms, stats & insights", icon: "account-circle-outline" },
  { href: "/dashboard/coach", title: "Wellness Coach Dashboard", subtitle: "Assigned users & trends", icon: "account-heart-outline" },
  { href: "/dashboard/admin", title: "Admin Dashboard", subtitle: "Platform-wide analytics", icon: "shield-crown-outline" },
] as const;

/** Role picker — in a real build this would route based on the logged-in user's role. */
export default function DashboardHubScreen() {
  const { colors, spacing, radius } = useAppTheme();

  return (
    <Screen>
      <View style={{ flex: 1, padding: spacing.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Dashboards" subtitle="Analytics for every role" />

        {DASHBOARDS.map((d) => (
          <TouchableOpacity key={d.href} onPress={() => router.push(d.href)} activeOpacity={0.8}>
            <Card style={{ marginBottom: spacing.md, flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: radius.md,
                  backgroundColor: colors.primary + "1A",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: spacing.md,
                }}
              >
                <MaterialCommunityIcons name={d.icon as any} size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="body" style={{ fontWeight: "700" }}>
                  {d.title}
                </AppText>
                <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 2 }}>
                  {d.subtitle}
                </AppText>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </Screen>
  );
}
