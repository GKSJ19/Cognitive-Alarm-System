import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Card, Button } from 'react-native-paper';
import { useAdmin } from '../../hooks/useAdmin';
import LoadingOverlay from '../../components/common/LoadingOverlay';

interface AdminDashboardScreenProps {
  navigation: any;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { dashboardStats, getDashboard, isLoading } = useAdmin();

  useEffect(() => {
    getDashboard();
  }, [getDashboard]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={isLoading} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: theme.colors.onBackground }]}>
            Admin Panel
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            System administrator diagnostic metrics and controls
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { flex: 0.48 }]}>
            <Card.Content style={styles.center}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {dashboardStats?.total_users || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Total Users
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { flex: 0.48 }]}>
            <Card.Content style={styles.center}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>
                {dashboardStats?.active_users || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Active Users
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { flex: 0.48 }]}>
            <Card.Content style={styles.center}>
              <Text style={[styles.statValue, { color: '#EF4444' }]}>
                {dashboardStats?.inactive_users || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Suspended/Inactive
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { flex: 0.48 }]}>
            <Card.Content style={styles.center}>
              <Text style={[styles.statValue, { color: theme.colors.secondary }]}>
                {dashboardStats?.total_coaches || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Total Coaches
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { flex: 0.48 }]}>
            <Card.Content style={styles.center}>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                {dashboardStats?.total_alarms || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Alarms Setup
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { flex: 0.48 }]}>
            <Card.Content style={styles.center}>
              <Text style={[styles.statValue, { color: '#3B82F6' }]}>
                {dashboardStats?.total_habits || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Habits Tracked
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { flex: 0.48 }]}>
            <Card.Content style={styles.center}>
              <Text style={[styles.statValue, { color: '#8B5CF6' }]}>
                {dashboardStats?.todays_wakeups || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Today's Wake-ups
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { flex: 0.48 }]}>
            <Card.Content style={styles.center}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>
                {dashboardStats?.system_health || 'Healthy'}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                System Health
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Admin Navigation Options */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>System Management</Text>
            <View style={styles.actionsGrid}>
              <Button mode="elevated" icon="account-multiple" onPress={() => navigation.navigate('UserManagement')} style={styles.actionBtn}>
                Users
              </Button>
              <Button mode="elevated" icon="teach" onPress={() => navigation.navigate('CoachManagement')} style={styles.actionBtn}>
                Coaches
              </Button>
              <Button mode="elevated" icon="cog-outline" onPress={() => navigation.navigate('SystemSettings')} style={styles.actionBtn}>
                Settings
              </Button>
              <Button mode="elevated" icon="script-text-outline" onPress={() => navigation.navigate('SystemLogs')} style={styles.actionBtn}>
                Audit Logs
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
    fontSize: 22,
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

export default AdminDashboardScreen;
