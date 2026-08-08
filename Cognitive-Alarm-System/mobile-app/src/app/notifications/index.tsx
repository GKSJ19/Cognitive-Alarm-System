import { useState } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";
import EmptyState from "@/components/common/EmptyState";

import { useAppTheme } from "@/hooks/useAppTheme";
import { NOTIFICATIONS } from "@/data/mock/notifications";

export default function NotificationCenterScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const [items, setItems] = useState(NOTIFICATIONS);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={markAllRead}>
            <AppText variant="caption" style={{ color: colors.primary, fontWeight: "700" }}>
              Mark all read
            </AppText>
          </TouchableOpacity>
        </View>

        <Header title="Notifications" />

        {items.length === 0 ? (
          <EmptyState icon="bell-off-outline" title="You're all caught up" />
        ) : (
          items.map((n) => (
            <Card
              key={n.id}
              style={{
                marginBottom: spacing.md,
                borderLeftWidth: n.read ? 0 : 3,
                borderLeftColor: colors.primary,
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <MaterialCommunityIcons name={n.icon as any} size={22} color={colors.primary} style={{ marginRight: spacing.md }} />
                <View style={{ flex: 1 }}>
                  <AppText variant="body" style={{ fontWeight: n.read ? "400" : "700" }}>
                    {n.title}
                  </AppText>
                  <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 2 }}>
                    {n.body}
                  </AppText>
                  <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 4 }}>
                    {n.timestamp}
                  </AppText>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
