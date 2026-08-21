import { useCallback, useEffect, useState } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";
import EmptyState from "@/components/common/EmptyState";

import { useAppTheme } from "@/hooks/useAppTheme";
import {
  listNotifications,
  markAllRead,
  markRead,
  type BackendNotification,
} from "@/services/api/notification.api";
import { getNotificationDisplay, formatNotificationTimestamp } from "@/utils/notificationDisplay";

export default function NotificationCenterScreen() {
  const { colors, spacing } = useAppTheme();
  const [items, setItems] = useState<BackendNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await listNotifications({ limit: 50 });
      setItems(res.notifications);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkAllRead = async () => {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
    try {
      await markAllRead();
    } catch {
      load(); // reconcile with server if the call failed
    }
  };

  const handlePressItem = async (n: BackendNotification) => {
    if (n.read_at) return;
    setItems((prev) => prev.map((item) => (item.id === n.id ? { ...item, read_at: new Date().toISOString() } : item)));
    try {
      await markRead(n.id);
    } catch {
      load();
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMarkAllRead}>
            <AppText variant="caption" style={{ color: colors.primary, fontWeight: "700" }}>
              Mark all read
            </AppText>
          </TouchableOpacity>
        </View>

        <Header title="Notifications" />

        {loading ? (
          <AppText variant="body" style={{ color: colors.textSecondary }}>
            Loading…
          </AppText>
        ) : items.length === 0 ? (
          <EmptyState icon="bell-off-outline" title="You're all caught up" />
        ) : (
          items.map((n) => {
            const display = getNotificationDisplay(n.type);
            const isRead = !!n.read_at;
            return (
              <TouchableOpacity key={n.id} onPress={() => handlePressItem(n)} activeOpacity={0.7}>
                <Card
                  style={{
                    marginBottom: spacing.md,
                    borderLeftWidth: isRead ? 0 : 3,
                    borderLeftColor: colors.primary,
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <MaterialCommunityIcons name={display.icon as any} size={22} color={colors.primary} style={{ marginRight: spacing.md }} />
                    <View style={{ flex: 1 }}>
                      <AppText variant="body" style={{ fontWeight: isRead ? "400" : "700" }}>
                        {display.title}
                      </AppText>
                      <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 2 }}>
                        {n.message}
                      </AppText>
                      <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 4 }}>
                        {formatNotificationTimestamp(n.sent_at)}
                      </AppText>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}