import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Text, useTheme, Card, Avatar, Chip, ProgressBar } from 'react-native-paper';
import { useAdmin } from '../../hooks/useAdmin';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import ThemeBackground from '../../components/common/ThemeBackground';

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
    <ThemeBackground>
      <View style={styles.container}>
        <LoadingOverlay visible={isLoading && !data} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => userId && getUserAnalytics(userId)} tintColor="#A58BFF" />}
        >
          {/* --- USER HEADER CARD --- */}
          <Card style={styles.heroCard}>
            <Card.Content style={styles.heroContent}>
              <Avatar.Text size={56} label={user?.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'} style={{ backgroundColor: '#A58BFF' }} color="#0D0B14" />
              <Text style={[styles.userName, { color: '#FFFFFF' }]}>{user?.full_name ?? 'User Analytics'}</Text>
              <Text style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>{user?.email}</Text>
              
              <View style={styles.badgeRow}>
                <Chip compact style={{ backgroundColor: user?.account_status === 'Active' ? '#1A382B' : '#451A1A', marginRight: 8 }}>
                  <Text style={{ color: user?.account_status === 'Active' ? '#34D399' : '#F87171', fontWeight: 'bold', fontSize: 11 }}>
                    {user?.account_status ?? 'ACTIVE'}
                  </Text>
                </Chip>
                <Chip compact style={{ backgroundColor: '#2C2243' }}>
                  <Text style={{ color: '#A58BFF', fontWeight: 'bold', fontSize: 11 }}>
                    Coach: {user?.assigned_coach ? user.assigned_coach.full_name : 'Unassigned'}
                  </Text>
                </Chip>
              </View>
            </Card.Content>
          </Card>

          {/* --- HABIT SCORE ANALYTICS CARD --- */}
          <Text style={[styles.sectionHeading, { color: '#FFFFFF' }]}>Habit Score Analytics</Text>
          <Card style={styles.card}>
            <Card.Content style={{ alignItems: 'center', paddingVertical: 16 }}>
              <Text style={[styles.scoreValText, { color: '#A58BFF' }]}>{habit?.current_score?.toFixed(1) ?? '0.0'}</Text>
              <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 'bold' }}>
                Current Honor Score
              </Text>
              
              <View style={styles.analyticsGridRow}>
                <View style={styles.analyticsGridCol}>
                  <Text style={[styles.gridValText, { color: '#34D399' }]}>{habit?.weekly_score?.toFixed(1) ?? '0.0'}</Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 11 }}>Weekly Avg</Text>
                </View>
                <View style={styles.dividerVertical} />
                <View style={styles.analyticsGridCol}>
                  <Text style={[styles.gridValText, { color: '#B49BFF' }]}>{habit?.monthly_score?.toFixed(1) ?? '0.0'}</Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 11 }}>Monthly Avg</Text>
                </View>
                <View style={styles.dividerVertical} />
                <View style={styles.analyticsGridCol}>
                  <Text style={[styles.gridValText, { color: '#FBBF24' }]}>{habit?.average_score?.toFixed(1) ?? '0.0'}</Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 11 }}>All-Time Avg</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* --- KEY PERFORMANCE METRICS GRID --- */}
          <Text style={[styles.sectionHeading, { color: '#FFFFFF' }]}>Cognitive & Alarm Metrics</Text>
          <View style={styles.metricsGrid}>
            <Card style={styles.metricCard}>
              <Card.Content style={styles.metricInner}>
                <Text style={[styles.metricVal, { color: '#A58BFF' }]}>{ch?.total_completed ?? 0}</Text>
                <Text style={styles.metricSub}>Puzzles Solved</Text>
              </Card.Content>
            </Card>

            <Card style={styles.metricCard}>
              <Card.Content style={styles.metricInner}>
                <Text style={[styles.metricVal, { color: '#34D399' }]}>{ch?.success_percentage ?? 0}%</Text>
                <Text style={styles.metricSub}>Success Rate</Text>
              </Card.Content>
            </Card>

            <Card style={styles.metricCard}>
              <Card.Content style={styles.metricInner}>
                <Text style={[styles.metricVal, { color: '#B49BFF' }]}>{ch?.average_completion_time ? `${ch.average_completion_time}s` : '0s'}</Text>
                <Text style={styles.metricSub}>Avg Solve Time</Text>
              </Card.Content>
            </Card>

            <Card style={styles.metricCard}>
              <Card.Content style={styles.metricInner}>
                <Text style={[styles.metricVal, { color: '#FBBF24' }]}>{alarm?.total_alarms ?? 0}</Text>
                <Text style={styles.metricSub}>Configured Alarms</Text>
              </Card.Content>
            </Card>
          </View>

          {/* --- 7-DAY SCORE TREND CHART --- */}
          <Text style={[styles.sectionHeading, { color: '#FFFFFF' }]}>7-Day Score Trend</Text>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.barChartRow}>
                {(charts?.habit_score_trend || []).map((item: any, idx: number) => {
                  const val = item.avg_habit_score ?? item.score ?? 0;
                  const heightPercent = Math.max((val / 100) * 100, 10);
                  return (
                    <View key={idx} style={styles.barCol}>
                      <Text style={styles.barValText}>{val > 0 ? val.toFixed(0) : ''}</Text>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { height: `${heightPercent}%`, backgroundColor: '#A58BFF' }]} />
                      </View>
                      <Text style={styles.barDayText}>{item.day || item.date || ''}</Text>
                    </View>
                  );
                })}
              </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: 'rgba(26, 22, 38, 0.85)',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
    elevation: 4,
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
    marginTop: 12,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
    backgroundColor: 'rgba(26, 22, 38, 0.85)',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
    elevation: 3,
  },
  scoreValText: {
    fontSize: 44,
    fontWeight: '900',
  },
  analyticsGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(165, 139, 255, 0.1)',
  },
  analyticsGridCol: {
    alignItems: 'center',
    flex: 1,
  },
  gridValText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerVertical: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(165, 139, 255, 0.15)',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricCard: {
    width: '48%',
    backgroundColor: 'rgba(26, 22, 38, 0.85)',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
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
    color: '#A098BA',
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
    color: '#A098BA',
    marginBottom: 2,
  },
  barTrack: {
    width: 14,
    height: 70,
    backgroundColor: '#262036',
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
    color: '#A098BA',
  },
});

export default AdminUserAnalyticsScreen;
