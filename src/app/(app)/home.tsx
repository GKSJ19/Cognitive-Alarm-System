import { ScrollView, View, StyleSheet } from "react-native";
import { router } from "expo-router";

import Screen from "@/components/common/Screen";
import AppText from "@/components/common/AppText";
import Card from "@/components/cards/Card";
import SectionHeader from "@/components/common/SectionHeader";
import ListRow from "@/components/common/ListRow";
import QuickActionButton from "@/components/buttons/QuickActionButton";
import AlarmListItem from "@/components/alarms/AlarmListItem";
import EmptyState from "@/components/common/EmptyState";

import { useAuthStore } from "@/store/authStore";
import { useAlarmStore } from "@/store/alarmStore";
import { useAppTheme } from "@/hooks/useAppTheme";
import { DUMMY_SLEEP_SUMMARY, AI_SUGGESTIONS } from "@/data/sleepData";
import { getGreeting, formatTime12h } from "@/utils/date";
import { getNextAlarm, getRemainingTimeLabel, formatRepeatDays } from "@/utils/alarm";

export default function HomeScreen() {
  const { colors, spacing } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const alarms = useAlarmStore((state) => state.alarms);
  const toggleAlarm = useAlarmStore((state) => state.toggleAlarm);

  const nextAlarm = getNextAlarm(alarms);
  const upcomingAlarms = [...alarms]
    .filter((a) => a.enabled)
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 3);

  const sleep = DUMMY_SLEEP_SUMMARY;
  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <AppText variant="caption" style={{ color: colors.primary, fontWeight: "700" }}>
          {getGreeting().toUpperCase()}
        </AppText>
        <AppText variant="title" style={{ marginTop: 4 }}>
          {firstName} 👋
        </AppText>

        {/* Today's Sleep + Next Alarm */}
        <View style={[styles.row, { marginTop: spacing.xl, gap: spacing.md }]}>
          <Card style={styles.halfCard}>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              Today's Sleep
            </AppText>
            <AppText variant="title" style={{ marginTop: spacing.xs }}>
              {sleep.averageHours}h
            </AppText>
            <AppText variant="caption" style={{ color: colors.success, marginTop: 2 }}>
              Quality {sleep.averageQuality}%
            </AppText>
          </Card>

          <Card style={styles.halfCard}>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              Next Alarm
            </AppText>
            <AppText variant="title" style={{ marginTop: spacing.xs }}>
              {nextAlarm ? formatTime12h(nextAlarm.time) : "--:--"}
            </AppText>
            <AppText variant="caption" style={{ color: colors.primary, marginTop: 2 }}>
              {getRemainingTimeLabel(nextAlarm)}
            </AppText>
          </Card>
        </View>

        {/* Today's Alarms */}
        <View style={{ marginTop: spacing.xl }}>
          <SectionHeader
            title="Today's Alarms"
            actionLabel="See all"
            onActionPress={() => router.push("/(app)/alarms")}
          />

          {upcomingAlarms.length === 0 ? (
            <Card>
              <EmptyState
                icon="alarm-off"
                title="No alarms yet"
                description="Add your first alarm to get started."
                actionLabel="Add Alarm"
                onActionPress={() => router.push("/(app)/alarms/add")}
              />
            </Card>
          ) : (
            upcomingAlarms.map((alarm) => (
              <AlarmListItem
                key={alarm.id}
                alarm={alarm}
                onToggle={(enabled) => toggleAlarm(alarm.id, enabled)}
                onPress={() => router.push(`/(app)/alarms/${alarm.id}`)}
              />
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader title="Quick Actions" />
          <View style={[styles.row, { gap: spacing.md }]}>
            <QuickActionButton
              icon="plus-circle"
              label="Add Alarm"
              onPress={() => router.push("/(app)/alarms/add")}
            />
            <QuickActionButton
              icon="chart-line"
              label="Sleep Report"
              onPress={() => router.push("/(app)/analytics")}
            />
            <QuickActionButton
              icon="robot-happy-outline"
              label="AI Suggestion"
              onPress={() => router.push("/(app)/analytics")}
            />
            <QuickActionButton
              icon="cog-outline"
              label="Settings"
              onPress={() => router.push("/(app)/profile")}
            />
          </View>
        </View>

        {/* AI Suggestion highlight */}
        <Card style={{ marginTop: spacing.lg }}>
          <View style={styles.row}>
            <AppText variant="body" style={{ flex: 1, color: colors.textSecondary }}>
              💡 {AI_SUGGESTIONS[0]}
            </AppText>
          </View>
        </Card>

        {/* Recent Activity */}
        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader title="Recent Activity" />
          <Card>
            <ListRow
              icon="alarm-check"
              title="Work alarm dismissed"
              subtitle="Today, 7:32 AM"
            />
            <ListRow
              icon="moon-waning-crescent"
              title="Sleep session logged"
              subtitle="Yesterday, 11:04 PM · 7.1h"
            />
            <ListRow
              icon="pencil-outline"
              title="Weekend Lie-in updated"
              subtitle="2 days ago"
            />
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  halfCard: {
    flex: 1,
  },
});
