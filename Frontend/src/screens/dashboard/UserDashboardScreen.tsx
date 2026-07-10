import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme, Card, IconButton, Button } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useAlarms } from '../../hooks/useAlarms';
import { useHabits } from '../../hooks/useHabits';
import LoadingOverlay from '../../components/common/LoadingOverlay';

interface UserDashboardScreenProps {
  navigation: any;
}

export const UserDashboardScreen: React.FC<UserDashboardScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { alarms, history, getAlarms, getHistory, isLoading: alarmsLoading } = useAlarms();
  const { habits, progress, getHabits, getProgress, isLoading: habitsLoading } = useHabits();

  useEffect(() => {
    getAlarms();
    getHistory();
    getHabits();
    getProgress();
  }, [getAlarms, getHistory, getHabits, getProgress]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations
  const activeAlarms = alarms.filter(a => a.is_active);
  const nextAlarm = activeAlarms.length > 0 
    ? [...activeAlarms].sort((a, b) => a.alarm_time.localeCompare(b.alarm_time))[0]
    : null;

  const todayHabits = habits.filter(h => h.is_active);
  const completedToday = progress.filter(p => p.completion_date === todayStr && p.status === 'completed');
  const completionRate = todayHabits.length > 0
    ? Math.round((completedToday.length / todayHabits.length) * 100)
    : 0;

  // Wake up streak
  const wakeUpStreak = history.length > 0 
    ? [...history].sort((a, b) => b.dismissed_at.localeCompare(a.dismissed_at))[0].solved ? 5 : 0 // mockup/stub fallback
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={alarmsLoading || habitsLoading} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Welcome Section */}
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: theme.colors.onBackground }]}>
            Hello, {user?.full_name}!
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Rise, solve, and conquer your routines.
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { flex: 0.48 }]}>
            <Card.Content style={styles.center}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                🔥 {wakeUpStreak} days
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Wake-up Streak
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { flex: 0.48 }]}>
            <Card.Content style={styles.center}>
              <Text style={[styles.statValue, { color: theme.colors.secondary }]}>
                🎯 {completionRate}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Habit Completion
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Today's Next Alarm */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Upcoming Alarm</Text>
            {nextAlarm ? (
              <View style={styles.alarmInfo}>
                <View>
                  <Text style={[styles.alarmTime, { color: theme.colors.onSurface }]}>
                    {nextAlarm.alarm_time}
                  </Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>{nextAlarm.title}</Text>
                </View>
                {nextAlarm.challenge_required ? (
                  <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Text style={{ color: theme.colors.onPrimaryContainer, fontSize: 10, fontWeight: 'bold' }}>
                      🧠 {nextAlarm.challenge_type.toUpperCase()}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>No upcoming alarms scheduled.</Text>
            )}
          </Card.Content>
        </Card>

        {/* Today's Habits Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Today's Habits</Text>
            {todayHabits.length === 0 ? (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>No active habits found.</Text>
            ) : (
              todayHabits.slice(0, 3).map(h => {
                const isDone = completedToday.some(p => p.habit_id === h.habit_id);
                return (
                  <View key={h.habit_id} style={styles.habitRow}>
                    <Text style={{ color: isDone ? '#64748B' : theme.colors.onSurface, textDecorationLine: isDone ? 'line-through' : 'none' }}>
                      {h.title}
                    </Text>
                    <IconButton
                      icon={isDone ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                      iconColor={isDone ? theme.colors.primary : theme.colors.outline}
                      size={20}
                      style={{ margin: 0 }}
                    />
                  </View>
                );
              })
            )}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Button mode="elevated" icon="alarm-plus" onPress={() => navigation.navigate('Alarms', { screen: 'CreateAlarm' })} style={styles.actionBtn}>
                Add Alarm
              </Button>
              <Button mode="elevated" icon="plus" onPress={() => navigation.navigate('Habits', { screen: 'CreateHabit' })} style={styles.actionBtn}>
                Add Habit
              </Button>
              <Button mode="elevated" icon="account-cog" onPress={() => navigation.navigate('Profile')} style={styles.actionBtn}>
                Edit Profile
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Recent Activity</Text>
            {history.length === 0 && completedToday.length === 0 ? (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>No recent activities logged today.</Text>
            ) : (
              <View>
                {history.slice(0, 2).map((log, idx) => (
                  <Text key={log.history_id || idx} style={[styles.activityText, { color: theme.colors.onSurfaceVariant }]}>
                    🔔 Alarm dismissed at {log.wake_time} (Solved challenge in {log.solve_time}s)
                  </Text>
                ))}
                {completedToday.slice(0, 2).map((p, idx) => {
                  const matchingHabit = habits.find(h => h.habit_id === p.habit_id);
                  return (
                    <Text key={p.progress_id || idx} style={[styles.activityText, { color: theme.colors.onSurfaceVariant }]}>
                      🔥 Completed Habit: "{matchingHabit?.title || 'Habit'}"
                    </Text>
                  );
                })}
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    borderRadius: 16,
  },
  center: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  alarmInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alarmTime: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionBtn: {
    width: '48%',
    marginBottom: 10,
    borderRadius: 12,
  },
  activityText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
});

export default UserDashboardScreen;
