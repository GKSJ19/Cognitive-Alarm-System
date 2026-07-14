import { View, FlatList } from "react-native";
import { router } from "expo-router";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import EmptyState from "@/components/common/EmptyState";
import AlarmListItem from "@/components/alarms/AlarmListItem";
import FAB from "@/components/buttons/FAB";

import { useAlarmStore } from "@/store/alarmStore";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function AlarmListScreen() {
  const { spacing } = useAppTheme();
  const alarms = useAlarmStore((state) => state.alarms);
  const toggleAlarm = useAlarmStore((state) => state.toggleAlarm);

  const sorted = [...alarms].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Screen>
      <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
        <Header title="Alarms" subtitle={`${alarms.length} total`} />

        {sorted.length === 0 ? (
          <EmptyState
            icon="alarm-off"
            title="No alarms yet"
            description="Tap the + button to create your first alarm."
          />
        ) : (
          <FlatList
            data={sorted}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <AlarmListItem
                alarm={item}
                onToggle={(enabled) => toggleAlarm(item.id, enabled)}
                onPress={() => router.push(`/(app)/alarms/${item.id}`)}
              />
            )}
          />
        )}
      </View>

      <FAB accessibilityLabel="Add alarm" onPress={() => router.push("/(app)/alarms/add")} />
    </Screen>
  );
}
