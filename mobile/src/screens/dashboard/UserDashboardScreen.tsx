import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme, Card, IconButton, Button } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useAlarms } from '../../hooks/useAlarms';
import { useHabits } from '../../hooks/useHabits';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import ThemeBackground from '../../components/common/ThemeBackground';

interface UserDashboardScreenProps {
  navigation: any;
}

export const UserDashboardScreen: React.FC<UserDashboardScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { alarms, history, getAlarms, getHistory, isLoading: alarmsLoading } = useAlarms();
  const { currentScore, dashboardData, getHabitDashboard, isLoading: habitsLoading } = useHabits();

  useEffect(() => {
    getAlarms();
    getHistory();
    getHabitDashboard();
  }, [getAlarms, getHistory, getHabitDashboard]);

  const activeAlarms = alarms.filter(a => a.is_active);
  const nextAlarm = activeAlarms.length > 0 
    ? [...activeAlarms].sort((a, b) => a.alarm_time.localeCompare(b.alarm_time))[0]
    : null;

  const totalChallenges = dashboardData?.total_challenges_completed ?? 0;
  const successRate = dashboardData?.success_rate ?? 0;
  const wakeUpStreak = history.length > 0 ? history.filter(h => h.solved).length : 0;

  return (
    <ThemeBackground>
      <View style={styles.container}>
        <LoadingOverlay visible={alarmsLoading || habitsLoading} />
        
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Welcome Section */}
          <View style={styles.header}>
            <Text style={[styles.welcomeText, { color: '#FFFFFF' }]}>
              Hello, {user?.full_name}! 👋
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Rise, solve cognitive challenges, and conquer your day.
            </Text>
          </View>

          {/* Honor Score & Core Stats Grid */}
          <View style={styles.statsRow}>
            <Card 
              style={[styles.statCard, { flex: 0.31, backgroundColor: 'rgba(26, 22, 38, 0.95)', borderColor: 'rgba(165, 139, 255, 0.25)' }]}
              onPress={() => navigation.navigate('Habits', { screen: 'HabitScoreDashboard' })}
            >
              <Card.Content style={styles.center}>
                <Text style={[styles.statValue, { color: '#A58BFF', fontSize: 22 }]}>
                  🧠 {currentScore}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Honor Score
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { flex: 0.31, backgroundColor: 'rgba(26, 22, 38, 0.85)', borderColor: 'rgba(165, 139, 255, 0.15)' }]}>
              <Card.Content style={styles.center}>
                <Text style={[styles.statValue, { color: '#B49BFF', fontSize: 20 }]}>
                  🔥 {wakeUpStreak}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Wake-up Streak
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { flex: 0.31, backgroundColor: 'rgba(26, 22, 38, 0.85)', borderColor: 'rgba(165, 139, 255, 0.15)' }]}>
              <Card.Content style={styles.center}>
                <Text style={[styles.statValue, { color: '#34D399', fontSize: 20 }]}>
                  🎯 {successRate}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Success Rate
                </Text>
              </Card.Content>
            </Card>
          </View>

          {/* Today's Next Alarm */}
          <Card style={[styles.card, { backgroundColor: 'rgba(26, 22, 38, 0.85)', borderColor: 'rgba(165, 139, 255, 0.15)' }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: '#A58BFF' }]}>Upcoming Alarm</Text>
              {nextAlarm ? (
                <View style={styles.alarmInfo}>
                  <View>
                    <Text style={[styles.alarmTime, { color: '#FFFFFF' }]}>
                      {nextAlarm.alarm_time}
                    </Text>
                    <Text style={{ color: theme.colors.onSurfaceVariant }}>{nextAlarm.title}</Text>
                  </View>
                  {nextAlarm.challenge_required ? (
                    <View style={[styles.badge, { backgroundColor: '#2C2243' }]}>
                      <Text style={{ color: '#A58BFF', fontSize: 11, fontWeight: 'bold' }}>
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

          {/* Quick Actions */}
          <Card style={[styles.card, { backgroundColor: 'rgba(26, 22, 38, 0.85)', borderColor: 'rgba(165, 139, 255, 0.15)' }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: '#A58BFF' }]}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                <Button mode="elevated" icon="alarm-plus" onPress={() => navigation.navigate('Alarms', { screen: 'CreateAlarm' })} style={styles.actionBtn} buttonColor="#2C2243" textColor="#A58BFF">
                  Add Alarm
                </Button>
                <Button mode="elevated" icon="chart-line" onPress={() => navigation.navigate('Habits', { screen: 'HabitScoreDashboard' })} style={styles.actionBtn} buttonColor="#2C2243" textColor="#A58BFF">
                  Habit Analytics
                </Button>
                <Button mode="elevated" icon="account-cog" onPress={() => navigation.navigate('Profile')} style={styles.actionBtn} buttonColor="#2C2243" textColor="#A58BFF">
                  Edit Profile
                </Button>
                <Button mode="elevated" icon="bell-outline" onPress={() => navigation.navigate('NotificationsTab')} style={styles.actionBtn} buttonColor="#2C2243" textColor="#A58BFF">
                  Broadcasts
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Recent Challenge Activity */}
          <Card style={[styles.card, { backgroundColor: 'rgba(26, 22, 38, 0.85)', borderColor: 'rgba(165, 139, 255, 0.15)' }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: '#A58BFF' }]}>Recent Cognitive Activity</Text>
              {history.length === 0 && (!dashboardData?.recent_history || dashboardData.recent_history.length === 0) ? (
                <Text style={{ color: theme.colors.onSurfaceVariant }}>No recent activities logged today.</Text>
              ) : (
                <View>
                  {history.slice(0, 3).map((log, idx) => (
                    <Text key={log.history_id || idx} style={[styles.activityText, { color: '#A098BA' }]}>
                      🔔 Alarm dismissed at {log.wake_time} (Solved challenge in {log.solve_time}s)
                    </Text>
                  ))}
                  {(dashboardData?.recent_history || []).slice(0, 3).map((item, idx) => (
                    <Text key={item.id || idx} style={[styles.activityText, { color: '#A098BA' }]}>
                      🧠 Solved {item.challenge_type.toUpperCase()} ({item.difficulty}) challenge (Score: +{item.habit_score})
                    </Text>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        </ScrollView>
      </View>
    </ThemeBackground>
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
    borderRadius: 20,
    borderWidth: 1,
    elevation: 4,
  },
  center: {
    alignItems: 'center',
    paddingVertical: 12,
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
    borderRadius: 20,
    borderWidth: 1,
    elevation: 4,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionBtn: {
    width: '48%',
    marginBottom: 10,
    borderRadius: 14,
  },
  activityText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
});

export default UserDashboardScreen;

