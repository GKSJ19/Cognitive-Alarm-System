import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Text, useTheme, Card, Avatar, Chip, Button, Snackbar, List } from 'react-native-paper';
import { useCoach } from '../../hooks/useCoach';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';

interface UserDetailsScreenProps {
  route: any;
  navigation: any;
}

export const UserDetailsScreen: React.FC<UserDetailsScreenProps> = ({ route }) => {
  const theme = useTheme();
  const { userId, fullName } = route.params || {};
  const { selectedUserAnalytics, getAssignedUserAnalytics, sendMessage, isLoading, error, clearError } = useCoach();

  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      getAssignedUserAnalytics(userId);
    }
  }, [userId, getAssignedUserAnalytics]);

  const handleSendMessage = async () => {
    if (!msgTitle.trim() || !msgBody.trim()) {
      setSnackbarMessage("Subject and message content are required");
      return;
    }
    try {
      await sendMessage(userId, msgTitle.trim(), msgBody.trim()).unwrap();
      setMsgTitle('');
      setMsgBody('');
      setSnackbarMessage("Motivational message delivered to client! 💌");
    } catch (err) {
      setSnackbarMessage("Failed to send message");
    }
  };

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
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => userId && getAssignedUserAnalytics(userId)} tintColor={theme.colors.primary} />}
      >
        {/* --- CLIENT HEADER CARD --- */}
        <Card style={[styles.heroCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.heroContent}>
            <Avatar.Text
              size={56}
              label={user?.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : (fullName ? fullName[0] : 'C')}
              style={{ backgroundColor: theme.colors.secondary }}
            />
            <Text style={[styles.userName, { color: theme.colors.onSurface }]}>{user?.full_name ?? fullName ?? 'Client Details'}</Text>
            <Text style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>{user?.email}</Text>
            
            <View style={styles.badgeRow}>
              <Chip compact style={{ backgroundColor: user?.account_status === 'Active' ? '#DCFCE7' : '#FEE2E2' }}>
                <Text style={{ color: user?.account_status === 'Active' ? '#166534' : '#991B1B', fontWeight: 'bold', fontSize: 11 }}>
                  {user?.account_status ?? 'ACTIVE'}
                </Text>
              </Chip>
              <Chip compact style={{ backgroundColor: '#EDE9FE', marginLeft: 8 }}>
                <Text style={{ color: '#5B21B6', fontWeight: 'bold', fontSize: 11 }}>
                  Reg: {user?.registration_date ?? 'Recent'}
                </Text>
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* --- HABIT SCORE METRICS --- */}
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
          </Card.Content>
        </Card>

        {/* --- CHALLENGE PERFORMANCE METRICS --- */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Cognitive Challenge Performance</Text>
        <View style={styles.metricsGrid}>
          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricInner}>
              <Text style={[styles.metricVal, { color: theme.colors.primary }]}>{ch?.total_completed ?? 0}</Text>
              <Text style={styles.metricSub}>Completed</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricInner}>
              <Text style={[styles.metricVal, { color: '#059669' }]}>{ch?.success_percentage ?? 0}%</Text>
              <Text style={styles.metricSub}>Success Rate</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricInner}>
              <Text style={[styles.metricVal, { color: '#D97706' }]}>{ch?.average_completion_time ?? 0}s</Text>
              <Text style={styles.metricSub}>Avg Solve Time</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricInner}>
              <Text style={[styles.metricVal, { color: '#7C3AED' }]}>{ch?.fastest_completion ?? 0}s</Text>
              <Text style={styles.metricSub}>Fastest Solve</Text>
            </Card.Content>
          </Card>
        </View>

        {/* --- ALARM PERFORMANCE --- */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Alarm & Wake-up Consistency</Text>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.scoreRow}>
              <View style={styles.scoreCol}>
                <Text style={[styles.scoreVal, { color: theme.colors.primary }]}>{alarm?.total_alarms ?? 0}</Text>
                <Text style={styles.scoreSub}>Alarms Setup</Text>
              </View>
              <View style={styles.scoreCol}>
                <Text style={[styles.scoreVal, { color: '#059669' }]}>{alarm?.completed_alarms ?? 0}</Text>
                <Text style={styles.scoreSub}>Solved</Text>
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

        {/* --- PERFORMANCE CHART (7 DAYS) --- */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>7-Day Score Progress</Text>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.barChartRow}>
              {(charts?.habit_score_trend || []).map((item: any, idx: number) => {
                const heightPercent = Math.max((item.habit_score / 100) * 100, 10);
                return (
                  <View key={idx} style={styles.barCol}>
                    <Text style={styles.barValText}>{item.habit_score > 0 ? item.habit_score.toFixed(0) : ''}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { height: `${heightPercent}%`, backgroundColor: theme.colors.secondary }]} />
                    </View>
                    <Text style={styles.barDayText}>{item.day}</Text>
                  </View>
                );
              })}
            </View>
          </Card.Content>
        </Card>

        {/* --- SEND MOTIVATIONAL NOTE --- */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Coach Message</Text>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <AppInput
              label="Subject"
              value={msgTitle}
              onChangeText={setMsgTitle}
              placeholder="e.g. Outstanding Wake-up Streak!"
            />
            <AppInput
              label="Message"
              value={msgBody}
              onChangeText={setMsgBody}
              placeholder="Your Habit Score jumped to 76.0 pts today! Keep pushing."
              multiline
              numberOfLines={3}
            />
            <AppButton mode="contained" onPress={handleSendMessage} style={{ marginTop: 10 }}>
              Send Coaching Message
            </AppButton>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={!!error || !!snackbarMessage}
        onDismiss={() => { setSnackbarMessage(null); clearError(); }}
        action={{ label: 'OK', onPress: () => { setSnackbarMessage(null); clearError(); } }}
        style={{ backgroundColor: error ? theme.colors.error : theme.colors.primary }}
      >
        {error || snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
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

export default UserDetailsScreen;
