import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Text, useTheme, Card, Avatar, Button, IconButton } from 'react-native-paper';
import { useAdmin } from '../../hooks/useAdmin';
import LoadingOverlay from '../../components/common/LoadingOverlay';

interface AdminDashboardScreenProps {
  navigation: any;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { dashboardOverview, getDashboardOverview, isLoading } = useAdmin();

  useEffect(() => {
    getDashboardOverview();
  }, [getDashboardOverview]);

  const cards = dashboardOverview?.overview_cards;
  const charts = dashboardOverview?.charts;
  const activities = dashboardOverview?.recent_activities || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={isLoading && !dashboardOverview} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={getDashboardOverview} tintColor={theme.colors.primary} />}
      >
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: theme.colors.onBackground }]}>
            Administrator Control Center
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Real-time platform telemetry, user management, and cognitive performance analytics
          </Text>
        </View>

        {/* --- OVERVIEW CARDS GRID --- */}
        <View style={styles.gridRow}>
          <Card style={[styles.cardCol, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardInner}>
              <Avatar.Icon size={36} icon="account-group" style={{ backgroundColor: '#DBEAFE' }} color="#1E40AF" />
              <Text style={[styles.cardVal, { color: theme.colors.primary }]}>{cards?.total_users ?? 0}</Text>
              <Text style={[styles.cardSub, { color: theme.colors.onSurfaceVariant }]}>Total Users</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.cardCol, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardInner}>
              <Avatar.Icon size={36} icon="teach" style={{ backgroundColor: '#EDE9FE' }} color="#5B21B6" />
              <Text style={[styles.cardVal, { color: theme.colors.secondary }]}>{cards?.total_coaches ?? 0}</Text>
              <Text style={[styles.cardSub, { color: theme.colors.onSurfaceVariant }]}>Total Coaches</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.gridRow}>
          <Card style={[styles.cardCol, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardInner}>
              <Avatar.Icon size={36} icon="account-check" style={{ backgroundColor: '#DCFCE7' }} color="#166534" />
              <Text style={[styles.cardVal, { color: '#059669' }]}>{cards?.active_users_today ?? 0}</Text>
              <Text style={[styles.cardSub, { color: theme.colors.onSurfaceVariant }]}>Active Today</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.cardCol, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardInner}>
              <Avatar.Icon size={36} icon="lightning-bolt" style={{ backgroundColor: '#FEF3C7' }} color="#92400E" />
              <Text style={[styles.cardVal, { color: '#D97706' }]}>{cards?.challenges_completed_today ?? 0}</Text>
              <Text style={[styles.cardSub, { color: theme.colors.onSurfaceVariant }]}>Solves Today</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.gridRow}>
          <Card style={[styles.cardCol, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardInner}>
              <Avatar.Icon size={36} icon="trophy-outline" style={{ backgroundColor: '#FCE7F3' }} color="#9D174D" />
              <Text style={[styles.cardVal, { color: '#BE185D' }]}>{cards?.average_habit_score?.toFixed(1) ?? '0.0'}</Text>
              <Text style={[styles.cardSub, { color: theme.colors.onSurfaceVariant }]}>Avg Habit Score</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.cardCol, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardInner}>
              <Avatar.Icon size={36} icon="alarm-check" style={{ backgroundColor: '#E0E7FF' }} color="#3730A3" />
              <Text style={[styles.cardVal, { color: '#4338CA' }]}>{cards?.active_alarms ?? 0}</Text>
              <Text style={[styles.cardSub, { color: theme.colors.onSurfaceVariant }]}>Active Alarms</Text>
            </Card.Content>
          </Card>
        </View>

        {/* --- PERFORMANCE CHARTS SECTION --- */}
        <Text style={[styles.sectionHeading, { color: theme.colors.onBackground }]}>Performance Trends</Text>

        <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.chartTitle, { color: theme.colors.onSurface }]}>Habit Score & Solve Trend (7 Days)</Text>
            <View style={styles.barChartRow}>
              {(charts?.habit_score_trend || []).map((item: any, idx: number) => {
                const heightPercent = Math.max((item.avg_habit_score / 100) * 100, 10);
                return (
                  <View key={idx} style={styles.barCol}>
                    <Text style={styles.barValText}>{item.avg_habit_score > 0 ? item.avg_habit_score.toFixed(0) : ''}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { height: `${heightPercent}%`, backgroundColor: theme.colors.primary }]} />
                    </View>
                    <Text style={styles.barDayText}>{item.day}</Text>
                  </View>
                );
              })}
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.chartTitle, { color: theme.colors.onSurface }]}>Challenge Difficulty Breakdown</Text>
            <View style={styles.diffDistributionRow}>
              {(charts?.challenge_difficulty_distribution || []).map((item: any, idx: number) => (
                <View key={idx} style={styles.diffCol}>
                  <Text style={[styles.diffVal, { color: theme.colors.primary }]}>{item.count}</Text>
                  <Text style={styles.diffSub}>{item.difficulty}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* --- RECENT ACTIVITIES FEED --- */}
        <Text style={[styles.sectionHeading, { color: theme.colors.onBackground }]}>Recent Platform Activity</Text>
        <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            {activities.length === 0 ? (
              <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginVertical: 10 }}>
                No recent activity logged.
              </Text>
            ) : (
              activities.map((act: any) => (
                <View key={act.id} style={styles.actRow}>
                  <Avatar.Icon size={32} icon={act.icon || "bell-ring"} style={{ backgroundColor: '#F1F5F9' }} color="#2563EB" />
                  <View style={styles.actContent}>
                    <Text style={[styles.actTitle, { color: theme.colors.onSurface }]}>{act.title}</Text>
                    <Text style={[styles.actTime, { color: theme.colors.onSurfaceVariant }]}>{act.time}</Text>
                  </View>
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* --- MANAGEMENT ACTIONS --- */}
        <Text style={[styles.sectionHeading, { color: theme.colors.onBackground }]}>Admin Navigation</Text>
        <View style={styles.actionsGrid}>
          <Button mode="contained-tonal" icon="account-multiple" onPress={() => navigation.navigate('UserManagement')} style={styles.actionBtn}>
            Manage Users
          </Button>
          <Button mode="contained-tonal" icon="teach" onPress={() => navigation.navigate('CoachManagement')} style={styles.actionBtn}>
            Manage Coaches
          </Button>
        </View>
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
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardCol: {
    width: '48%',
    borderRadius: 16,
  },
  cardInner: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cardVal: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 6,
  },
  cardSub: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 10,
  },
  chartCard: {
    borderRadius: 16,
    marginBottom: 14,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  barChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    marginTop: 6,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barValText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 2,
  },
  barTrack: {
    width: 14,
    height: 70,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barDayText: {
    fontSize: 10,
    marginTop: 4,
    color: '#64748B',
  },
  diffDistributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  diffCol: {
    alignItems: 'center',
  },
  diffVal: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  diffSub: {
    fontSize: 12,
    color: '#64748B',
  },
  actRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  actContent: {
    marginLeft: 12,
    flex: 1,
  },
  actTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  actTime: {
    fontSize: 10,
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionBtn: {
    width: '48%',
    borderRadius: 12,
  },
});

export default AdminDashboardScreen;
