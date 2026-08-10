import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Card, Button } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useAlarms } from '../../hooks/useAlarms';
import LoadingOverlay from '../../components/common/LoadingOverlay';

interface UserDashboardScreenProps {
  navigation: any;
}

export const UserDashboardScreen: React.FC<UserDashboardScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { alarms, history, getAlarms, getHistory, isLoading: alarmsLoading } = useAlarms();

  useEffect(() => {
    getAlarms();
    getHistory();
  }, [getAlarms, getHistory]);

  // Calculations
  const totalAlarms = alarms.length;
  const activeAlarms = alarms.filter(a => a.is_active);
  const activeAlarmsCount = activeAlarms.length;
  
  const nextAlarm = activeAlarms.length > 0 
    ? [...activeAlarms].sort((a, b) => a.alarm_time.localeCompare(b.alarm_time))[0]
    : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={alarmsLoading} />
      
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
                🔔 {totalAlarms}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Total Alarms
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { flex: 0.48 }]}>
            <Card.Content style={styles.center}>
              <Text style={[styles.statValue, { color: theme.colors.secondary }]}>
                ✨ {activeAlarmsCount} active
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Active Alarms
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
                {nextAlarm.challenge_type ? (
                  <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Text style={{ color: theme.colors.onPrimaryContainer, fontSize: 10, fontWeight: 'bold' }}>
                      🧠 {nextAlarm.challenge_type.toUpperCase()}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>No upcoming active alarms scheduled.</Text>
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
              <Button mode="elevated" icon="alarm" onPress={() => navigation.navigate('Alarms', { screen: 'AlarmList' })} style={styles.actionBtn}>
                View Alarms
              </Button>
              <Button mode="elevated" icon="account-cog" onPress={() => navigation.navigate('Profile')} style={styles.actionBtn}>
                View Profile
              </Button>
              <Button mode="elevated" icon="settings" onPress={() => navigation.navigate('Settings')} style={styles.actionBtn}>
                Settings
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Recent Wake-up History</Text>
            {history.length === 0 ? (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>No recent alarms dismissed yet.</Text>
            ) : (
              <View>
                {history.slice(0, 3).map((log, idx) => (
                  <Text key={log.history_id || idx} style={[styles.activityText, { color: theme.colors.onSurfaceVariant }]}>
                    ⏰ Alarm dismissed at {log.wake_time} (Solved in {log.solve_time}s)
                  </Text>
                ))}
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
