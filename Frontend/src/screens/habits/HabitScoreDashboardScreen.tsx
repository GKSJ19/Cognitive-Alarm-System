import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Text, useTheme, Card, ProgressBar, Chip, Avatar } from 'react-native-paper';
import { useHabits } from '../../hooks/useHabits';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { ChallengeResult, DifficultyPerformance, DailyScoreTrend } from '../../types/habit.types';

export const HabitScoreDashboardScreen: React.FC = () => {
  const theme = useTheme();
  const { dashboardData, currentScore, isLoading, getHabitDashboard } = useHabits();

  useEffect(() => {
    getHabitDashboard();
  }, [getHabitDashboard]);

  const onRefresh = () => {
    getHabitDashboard();
  };

  const getScoreTier = (score: number) => {
    if (score >= 75) return { label: '⚡ Apex Wake-Up', color: '#16A34A', bg: '#DCFCE7' };
    if (score >= 50) return { label: '🔥 Solid Performance', color: '#2563EB', bg: '#DBEAFE' };
    if (score >= 25) return { label: '📈 Improving Latency', color: '#D97706', bg: '#FEF3C7' };
    return { label: '🌱 Building Routine', color: '#7C3AED', bg: '#EDE9FE' };
  };

  const formatDifficultyColor = (diff: string) => {
    switch ((diff || '').toLowerCase()) {
      case 'hard': return { bg: '#FEE2E2', text: '#991B1B' };
      case 'medium': return { bg: '#EDE9FE', text: '#5B21B6' };
      default: return { bg: '#DCFCE7', text: '#166534' };
    }
  };

  const tier = getScoreTier(currentScore);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={isLoading && !dashboardData} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* --- MAIN HABIT SCORE HERO CARD --- */}
        <Card style={[styles.heroCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.heroContent}>
            <Text style={[styles.heroSub, { color: theme.colors.onSurfaceVariant }]}>Cognitive Habit Performance</Text>
            <View style={styles.scoreRow}>
              <Text style={[styles.heroScore, { color: theme.colors.primary }]}>
                {currentScore.toFixed(1)}
              </Text>
              <Text style={[styles.scoreDenominator, { color: theme.colors.onSurfaceVariant }]}>/ 100</Text>
            </View>

            <View style={[styles.tierBadge, { backgroundColor: tier.bg }]}>
              <Text style={[styles.tierText, { color: tier.color }]}>{tier.label}</Text>
            </View>

            <View style={styles.progressContainer}>
              <ProgressBar
                progress={Math.min(currentScore / 100, 1)}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
            </View>
          </Card.Content>
        </Card>

        {/* --- KEY METRICS GRID --- */}
        <View style={styles.metricsGrid}>
          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricContent}>
              <Avatar.Icon size={36} icon="timer-outline" style={{ backgroundColor: '#DBEAFE' }} color="#1E40AF" />
              <Text style={[styles.metricValue, { color: theme.colors.onSurface }]}>
                {dashboardData?.average_completion_time ? `${dashboardData.average_completion_time}s` : '0s'}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.colors.onSurfaceVariant }]}>Avg Solve Time</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricContent}>
              <Avatar.Icon size={36} icon="target" style={{ backgroundColor: '#EDE9FE' }} color="#5B21B6" />
              <Text style={[styles.metricValue, { color: theme.colors.onSurface }]}>
                {dashboardData?.total_challenges_completed ?? 0}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.colors.onSurfaceVariant }]}>Completed</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricContent}>
              <Avatar.Icon size={36} icon="check-decagram-outline" style={{ backgroundColor: '#DCFCE7' }} color="#166534" />
              <Text style={[styles.metricValue, { color: theme.colors.onSurface }]}>
                {dashboardData?.success_rate ? `${dashboardData.success_rate}%` : '0%'}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.colors.onSurfaceVariant }]}>Success Rate</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricContent}>
              <Avatar.Icon size={36} icon="lightning-bolt" style={{ backgroundColor: '#FEF3C7' }} color="#92400E" />
              <Text style={[styles.metricValue, { color: theme.colors.onSurface }]}>
                {dashboardData?.fastest_completion_time ? `${dashboardData.fastest_completion_time}s` : '0s'}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.colors.onSurfaceVariant }]}>Fastest Solve</Text>
            </Card.Content>
          </Card>
        </View>

        {/* --- WEEKLY VS MONTHLY ANALYTICS --- */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Habit Score Analytics</Text>
        </View>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.analyticsRow}>
              <View style={styles.analyticsCol}>
                <Text style={[styles.analyticsVal, { color: theme.colors.primary }]}>
                  {dashboardData?.weekly_avg_score ? dashboardData.weekly_avg_score.toFixed(1) : '0.0'}
                </Text>
                <Text style={[styles.analyticsSub, { color: theme.colors.onSurfaceVariant }]}>Weekly Avg Score</Text>
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.analyticsCol}>
                <Text style={[styles.analyticsVal, { color: theme.colors.secondary }]}>
                  {dashboardData?.monthly_avg_score ? dashboardData.monthly_avg_score.toFixed(1) : '0.0'}
                </Text>
                <Text style={[styles.analyticsSub, { color: theme.colors.onSurfaceVariant }]}>Monthly Avg Score</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* --- SCORE TREND (LAST 7 DAYS) --- */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>7-Day Score Trend</Text>
        </View>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.chartContainer}>
            <View style={styles.barChartRow}>
              {(dashboardData?.score_trend_7_days || []).map((item: DailyScoreTrend, index: number) => {
                const heightPercent = Math.max((item.average_score / 100) * 100, 10);
                const dayLabel = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <View key={index} style={styles.barCol}>
                    <Text style={styles.barValText}>{item.average_score > 0 ? item.average_score.toFixed(0) : ''}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { height: `${heightPercent}%`, backgroundColor: theme.colors.primary }]} />
                    </View>
                    <Text style={[styles.barDayText, { color: theme.colors.onSurfaceVariant }]}>{dayLabel}</Text>
                  </View>
                );
              })}
            </View>
          </Card.Content>
        </Card>

        {/* --- DIFFICULTY PERFORMANCE BREAKDOWN --- */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Difficulty Performance</Text>
        </View>

        <View style={styles.diffRow}>
          {(dashboardData?.difficulty_performance || []).map((diff: DifficultyPerformance, idx: number) => (
            <Card key={idx} style={[styles.diffCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.diffContent}>
                <Chip compact style={{ backgroundColor: formatDifficultyColor(diff.difficulty).bg }}>
                  <Text style={{ color: formatDifficultyColor(diff.difficulty).text, fontWeight: 'bold', fontSize: 11 }}>
                    {diff.difficulty.toUpperCase()}
                  </Text>
                </Chip>
                <Text style={[styles.diffScoreText, { color: theme.colors.onSurface }]}>
                  {diff.avg_score.toFixed(1)} <Text style={{ fontSize: 11, color: '#64748B' }}>pts</Text>
                </Text>
                <Text style={[styles.diffMeta, { color: theme.colors.onSurfaceVariant }]}>
                  {diff.avg_time_seconds}s avg | {diff.success_rate}%
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* --- RECENT CHALLENGE HISTORY --- */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Recent Challenge History</Text>
        </View>

        {(dashboardData?.recent_history || []).length === 0 ? (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={{ alignItems: 'center', paddingVertical: 24 }}>
              <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                No cognitive challenge history recorded yet. Solve alarm challenges to build your Habit Score!
              </Text>
            </Card.Content>
          </Card>
        ) : (
          (dashboardData?.recent_history || []).map((item: ChallengeResult) => {
            const diffStyle = formatDifficultyColor(item.difficulty);
            const formattedDate = new Date(item.completed_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <Card key={item.id} style={[styles.historyCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={styles.historyContent}>
                  <View style={styles.historyLeft}>
                    <View style={styles.historyHeader}>
                      <Text style={[styles.historyType, { color: theme.colors.onSurface }]}>
                        🧠 {item.challenge_type ? item.challenge_type.toUpperCase() : 'COGNITIVE'}
                      </Text>
                      <View style={[styles.diffBadge, { backgroundColor: diffStyle.bg }]}>
                        <Text style={[styles.diffBadgeText, { color: diffStyle.text }]}>
                          {item.difficulty.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.historyDate, { color: theme.colors.onSurfaceVariant }]}>
                      {formattedDate} • Solved in {item.time_taken_seconds}s ({item.attempts} {item.attempts === 1 ? 'attempt' : 'attempts'})
                    </Text>
                  </View>

                  <View style={styles.historyRight}>
                    <Text style={[styles.historyScore, { color: item.is_correct ? theme.colors.primary : theme.colors.error }]}>
                      +{item.habit_score.toFixed(1)}
                    </Text>
                    <Text style={[styles.historyScoreSub, { color: theme.colors.onSurfaceVariant }]}>Score</Text>
                  </View>
                </Card.Content>
              </Card>
            );
          })
        )}
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
    elevation: 3,
  },
  heroContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  heroSub: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  heroScore: {
    fontSize: 48,
    fontWeight: '900',
  },
  scoreDenominator: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 6,
  },
  tierBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  tierText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    borderRadius: 16,
    marginBottom: 12,
  },
  metricContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
  },
  analyticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  analyticsCol: {
    alignItems: 'center',
    flex: 1,
  },
  analyticsVal: {
    fontSize: 28,
    fontWeight: '800',
  },
  analyticsSub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  dividerVertical: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  chartContainer: {
    paddingVertical: 16,
  },
  barChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barValText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 4,
  },
  barTrack: {
    width: 16,
    height: 80,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barDayText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  diffCard: {
    width: '31%',
    borderRadius: 14,
  },
  diffContent: {
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  diffScoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 6,
  },
  diffMeta: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  historyCard: {
    borderRadius: 14,
    marginBottom: 10,
  },
  historyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  historyLeft: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyType: {
    fontSize: 15,
    fontWeight: '700',
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  diffBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  historyDate: {
    fontSize: 11,
    marginTop: 4,
  },
  historyRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  historyScore: {
    fontSize: 18,
    fontWeight: '800',
  },
  historyScoreSub: {
    fontSize: 10,
  },
});

export default HabitScoreDashboardScreen;
