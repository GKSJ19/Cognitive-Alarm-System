import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Text, useTheme, Card, Avatar, Chip, ProgressBar } from 'react-native-paper';
import { useAdmin } from '../../hooks/useAdmin';
import LoadingOverlay from '../../components/common/LoadingOverlay';

interface AdminUserAnalyticsScreenProps {
  route: any;
  navigation: any;
}

export const AdminUserAnalyticsScreen: React.FC<AdminUserAnalyticsScreenProps> = ({ route }) => {
  const theme = useTheme();
  const { userId } = route.params || {};
  const { selectedUserAnalytics, getUserAnalytics, isLoading } = useAdmin();

  useEffect(() => {
    if (userId) {
      getUserAnalytics(userId);
    }
  }, [userId, getUserAnalytics]);

  const data = selectedUserAnalytics;
  const user = data?.user_info;
  const ch = data?.challenge_analytics;
  const habit = data?.habit_score_analytics;
  const alarm = data?.alarm_analytics;
  const charts = data?.charts;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={isLoading && !data} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => userId && getUserAnalytics(userId)} tintColor={theme.colors.primary} />}
      >
        {/* --- USER HEADER CARD --- */}
        <Card style={[styles.heroCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.heroContent}>
            <Avatar.Text size={56} label={user?.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'} style={{ backgroundColor: theme.colors.primary }} />
            <Text style={[styles.userName, { color: theme.colors.onSurface }]}>{user?.full_name ?? 'User Analytics'}</Text>
            <Text style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>{user?.email}</Text>
            
            <View style={styles.badgeRow}>
              <Chip compact style={{ backgroundColor: user?.account_status === 'Active' ? '#DCFCE7' : '#FEE2E2', marginRight: 8 }}>
                <Text style={{ color: user?.account_status === 'Active' ? '#166534' : '#991B1B', fontWeight: 'bold', fontSize: 11 }}>
                  {user?.account_status ?? 'ACTIVE'}
                </Text>
              </Chip>
              <Chip compact style={{ backgroundColor: '#DBEAFE' }}>
                <Text style={{ color: '#1E40AF', fontWeight: 'bold', fontSize: 11 }}>
                  Coach: {user?.assigned_coach ? user.assigned_coach.full_name : 'Unassigned'}
                </Text>
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* --- HABIT SCORE ANALYTICS CARD --- */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Habit Score Analytics</Text>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.scoreRow}>
              <View style={styles.scoreCol}>
                <Text style={[styles.scoreVal, { color: theme.colors.primary }]}>{habit?.current_score?.toFixed(1) ?? '0.0'}</Text>
                <Text style={styles.scoreSub}>Current Score</Text>
              </View>
              <View style={styles.scoreCol}>
                <Text style={[styles.scoreVal, { color: '#7C3AED' }]}>{habit?.weekly_score?.toFixed(1) ?? '0.0'}</Text>
                <Text style={styles.scoreSub}>Weekly Avg</Text>
              </View>
              <View style={styles.scoreCol}>
                <Text style={[styles.scoreVal, { color: '#059669' }]}>{habit?.monthly_score?.toFixed(1) ?? '0.0'}</Text>
                <Text style={styles.scoreSub}>Monthly Avg</Text>
              </View>
            </View>

            <View style={styles.scoreMinMaxRow}>
              <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                Highest Score: <Text style={{ fontWeight: 'bold', color: '#16A34A' }}>{habit?.highest_score?.toFixed(1) ?? '0.0'}</Text> • 
                Lowest Score: <Text style={{ fontWeight: 'bold', color: '#DC2626' }}>{habit?.lowest_score?.toFixed(1) ?? '0.0'}</Text> • 
                Overall Avg: <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>{habit?.average_score?.toFixed(1) ?? '0.0'}</Text>
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* --- CHALLENGE ANALYTICS GRID --- */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Challenge Performance</Text>
        <View style={styles.metricsGrid}>
          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricInner}>
              <Text style={[styles.metricVal, { color: theme.colors.primary }]}>{ch?.total_completed ?? 0}</Text>
              <Text style={styles.metricSub}>Completed</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricInner}>
              <Text style={[styles.metricVal, { color: '#DC2626' }]}>{ch?.total_failed ?? 0}</Text>
              <Text style={styles.metricSub}>Failed</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricInner}>
              <Text style={[styles.metricVal, { color: '#059669' }]}>{ch?.success_percentage ?? 0}%</Text>
              <Text style={styles.metricSub}>Success %</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricInner}>
              <Text style={[styles.metricVal, { color: '#D97706' }]}>{ch?.average_completion_time ?? 0}s</Text>
              <Text style={styles.metricSub}>Avg Time</Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={{ fontSize: 13, color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
              Fastest Solve: <Text style={{ fontWeight: 'bold', color: '#16A34A' }}>{ch?.fastest_completion ?? 0}s</Text> • 
              Slowest Solve: <Text style={{ fontWeight: 'bold', color: '#DC2626' }}>{ch?.slowest_completion ?? 0}s</Text>
            </Text>
          </Card.Content>
        </Card>

        {/* --- ALARM ANALYTICS --- */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Alarm Telemetry</Text>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.scoreRow}>
              <View style={styles.scoreCol}>
                <Text style={[styles.scoreVal, { color: theme.colors.primary }]}>{alarm?.total_alarms ?? 0}</Text>
                <Text style={styles.scoreSub}>Total Alarms</Text>
              </View>
              <View style={styles.scoreCol}>
                <Text style={[styles.scoreVal, { color: '#059669' }]}>{alarm?.completed_alarms ?? 0}</Text>
                <Text style={styles.scoreSub}>Completed</Text>
              </View>
              <View style={styles.scoreCol}>
                <Text style={[styles.scoreVal, { color: '#DC2626' }]}>{alarm?.missed_alarms ?? 0}</Text>
                <Text style={styles.scoreSub}>Missed</Text>
              </View>
              <View style={styles.scoreCol}>
                <Text style={[styles.scoreVal, { color: '#7C3AED' }]}>{alarm?.wakeup_consistency ?? 0}%</Text>
                <Text style={styles.scoreSub}>Consistency</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* --- PERFORMANCE CHARTS --- */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>7-Day Score Trend Chart</Text>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.barChartRow}>
              {(charts?.habit_score_trend || []).map((item: any, idx: number) => {
                const heightPercent = Math.max((item.habit_score / 100) * 100, 10);
                return (
                  <View key={idx} style={styles.barCol}>
                    <Text style={styles.barValText}>{item.habit_score > 0 ? item.habit_score.toFixed(0) : ''}</Text>
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 20,
    marginBottom: 16,
  },
  heroContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    marginBottom: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  scoreCol: {
    alignItems: 'center',
  },
  scoreVal: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  scoreMinMaxRow: {
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricCard: {
    width: '48%',
    borderRadius: 14,
    marginBottom: 10,
  },
  metricInner: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
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
});

export default AdminUserAnalyticsScreen;
