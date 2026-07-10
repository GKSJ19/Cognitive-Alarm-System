import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Card, Button } from 'react-native-paper';
import { useCoach } from '../../hooks/useCoach';
import LoadingOverlay from '../../components/common/LoadingOverlay';

interface CoachDashboardScreenProps {
  navigation: any;
}

export const CoachDashboardScreen: React.FC<CoachDashboardScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { dashboardStats, getDashboard, isLoading } = useCoach();

  useEffect(() => {
    getDashboard();
  }, [getDashboard]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={isLoading} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: theme.colors.onBackground }]}>
            Coach Dashboard
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Monitor your assigned clients and their routines
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { flex: 0.48 }]}>
            <Card.Content style={styles.center}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {dashboardStats?.total_assigned_users || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Assigned Clients
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { flex: 0.48 }]}>
            <Card.Content style={styles.center}>
              <Text style={[styles.statValue, { color: theme.colors.secondary }]}>
                {dashboardStats?.active_users || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Active Clients
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { flex: 0.48 }]}>
            <Card.Content style={styles.center}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>
                {dashboardStats?.todays_wakeups || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Today's Wake-ups
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { flex: 0.48 }]}>
            <Card.Content style={styles.center}>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                {dashboardStats?.habit_completion_rate || 0.0}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Habit Completion
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { flex: 0.48 }]}>
            <Card.Content style={styles.center}>
              <Text style={[styles.statValue, { color: '#EF4444' }]}>
                {dashboardStats?.alarm_success_rate || 0.0}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Alarm Success
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { flex: 0.48 }]}>
            <Card.Content style={styles.center}>
              <Text style={[styles.statValue, { color: '#3B82F6' }]}>
                {dashboardStats?.challenge_success_rate || 0.0}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Puzzle Dismissals
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Quick actions for Coach */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Quick Navigation</Text>
            <View style={styles.actionsGrid}>
              <Button mode="elevated" icon="account-group" onPress={() => navigation.navigate('AssignedUsers')} style={styles.actionBtn}>
                Clients list
              </Button>
              <Button mode="elevated" icon="message-plus" onPress={() => navigation.navigate('Messages')} style={styles.actionBtn}>
                Send Message
              </Button>
              <Button mode="elevated" icon="chart-bar" onPress={() => navigation.navigate('CoachAnalytics')} style={styles.actionBtn}>
                Analytics
              </Button>
              <Button mode="elevated" icon="file-document-outline" onPress={() => navigation.navigate('CoachReports')} style={styles.actionBtn}>
                Reports
              </Button>
            </View>
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
    fontSize: 24,
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
});

export default CoachDashboardScreen;
